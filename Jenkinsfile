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

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Playwright Tests') {
            steps {
                sh 'PLAYWRIGHT_JUNIT_OUTPUT_FILE=test-results/playwright-junit.xml npm test'
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
