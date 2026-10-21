pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Deterministic Tests') {
            steps {
                sh 'PLAYWRIGHT_JUNIT_OUTPUT_FILE=test-results/deterministic-junit.xml npm run test:deterministic'
            }
        }

        stage('Live GitHub Test') {
            steps {
                sh 'PLAYWRIGHT_JUNIT_OUTPUT_FILE=test-results/live-junit.xml npm run test:live'
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'test-results/*-junit.xml'
            archiveArtifacts allowEmptyArchive: true, artifacts: 'playwright-report/**, test-results/**'
        }
    }
}
