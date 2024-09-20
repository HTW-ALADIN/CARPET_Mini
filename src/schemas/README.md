# Schemas

## JSON schemas

The JSON schemas are used as an intermediate representation of the CARPET-DSL. The JSON schemas can be generated by installing [typescript-json-schema](https://github.com/YousefED/typescript-json-schema) globally `npm install typescript-json-schema -g` and then executing `typescript-json-schema src/stores/applicationStore.ts "SerialisedTask" --ignoreErrors  --noExtraProps --required --out src/schemas/JSONSchemas/SerialisedTaskSchema.schema.json`. The JSON schemas are then used to 1. generate the zod schemas for runtime validation of the provided task schemas in the CARPET-DSL and 2. to generate documentation for the CARPET-DSL.

## zod schemas

The zod schemas are used for runtime validation of provided serialised task schemas in the CARPET-DSL in a JSON-format. The schemas can be generated by installing [json-schema-to-zod](https://github.com/StefanTerdell/json-schema-to-zod) globally `npm i -g json-schema-to-zod` and executing `json-schema-to-zod -i src/schemas/JSONSchemas/SerialisedTaskSchema.schema.json -o src/schemas/zodSchemas/SerialisedTaskSchema.ts`. The generated zod schemas are then used in the `src/stores/applicationStore.ts` to validate the provided task schemas.

[!CAUTION]
The zod schemas are generated by the `json-schema-to-zod` tool. The tool is not perfect and might generate valid but incorrect zod schemas. Therefore, the generated zod schemas should be checked manually and adjusted if necessary. A common error is that properties are marked as `.optional()` when they are required.