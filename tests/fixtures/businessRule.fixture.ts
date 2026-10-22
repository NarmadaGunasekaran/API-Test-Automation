import { expect, test as base } from '@playwright/test';

import { BusinessRuleValidatorPage } from '../pages/businessRuleValidator.page';

interface BusinessRuleFixtures {
  businessRuleValidator: BusinessRuleValidatorPage;
}

export const test = base.extend<BusinessRuleFixtures>({
  businessRuleValidator: new BusinessRuleValidatorPage(),
});

export { expect };
