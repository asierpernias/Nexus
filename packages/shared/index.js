const onion = require(`shared/onion`);
const crypto = require(`shared/crypto`);

module.exports = {
    ...onion,
    ...crypto
};