module.exports = {
    parserOptions: {
        ecmaVersion: 2016,
        sourceType: "module",
    },
    env: {
        es6: true,
        node: true,
    },
    rules: {
        "prettier/prettier": "error",

        // Bike-sheddable @typescript-eslint rules that differ from
        //   @typescript-eslint/recommended
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "off",
    },
    extends: [
        // Recommended rulesets from both ESLint and @typescript-eslint
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",

        // Disables ESLint rules that will conflict with eslint-plugin-prettier
        "prettier"
    ],
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "prettier"
    ],
};
