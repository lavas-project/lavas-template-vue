/**
 * @file validator for config
 * @author panyuqi
 * @desc validate lavas' config
 */
import Ajv from 'ajv';
import LavasConfigSchema from './config-schema.json';

const ajv = new Ajv({
    errorDataPath: 'configuration',
    allErrors: true,
    verbose: true
});
const validate = ajv.compile(LavasConfigSchema);

export default class ConfigValidator {

    /**
     * validate config with schema, throw an error when fails
     *
     * @param {Object} config config to validate
     */
    static validate(config) {
        if (!validate(config)) {
            if (validate.errors && validate.errors.length) {
                throw new Error(validate.errors.reduce((prev, cur) => {
                    let {dataPath, message} = cur;
                    dataPath = dataPath ? dataPath + ' ' : '';
                    return `${prev}${dataPath}${message}\n`;
                }, ''));
            }
        }
    }
}
