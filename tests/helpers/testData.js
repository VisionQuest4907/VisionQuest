const EMAIL_DOMAIN = 'user.authtest.com';
const MOD_PREFIX_GRADE = 'prdm4_grade_test_';
const MOD_PREFIX_CERT = 'prdm4_cert_test_';
const MOD_PREFIX_PROGRESS = 'prdm4_progress_test_';

let counter = 0;

function buildId(label = 't') {
  counter += 1;
  return `${label}_${Date.now()}_${counter}`;
}

function registerPayload(id, overrides = {}) {
  return {
    userName: `user_${id}`,
    email: `user_${id}@${EMAIL_DOMAIN}`,
    password: 'ValidPassw0rd!',
    ...overrides,
  };
}

function modulePayload(moduleID, overrides = {}) {
  return {
    moduleID,
    title: `Module ${moduleID}`,
    description: 'Deterministic test module',
    order: 900000,
    moduleQuestions: [],
    ...overrides,
  };
}

module.exports = {
  EMAIL_DOMAIN,
  MOD_PREFIX_GRADE,
  MOD_PREFIX_CERT,
  MOD_PREFIX_PROGRESS,
  buildId,
  registerPayload,
  modulePayload,
};