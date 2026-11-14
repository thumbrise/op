import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';

const read = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const ajv = new Ajv2020({ strict: false });
for (const name of ['nota', 'rail']) {
  ajv.addSchema(read(`../../docs/reference/${name}.v1.json`));
}
for (const name of ['rail', 'operation', 'instruction']) {
  ajv.addSchema(read(`../../docs/reference/${name}.v1.1.json`));
}
const candidate = ajv.getSchema('https://thumbrise.github.io/op/reference/rail.v1.1.json');
const legacy = ajv.getSchema('https://thumbrise.github.io/op/reference/rail.v1.json');
const term = (fields = {}) => ({ id: 'name', comment: '', kind: 'string', trait: [], ...fields });

test('instruction 1.1 resolves nullable terms on every rail', () => {
  const validate = ajv.getSchema('https://thumbrise.github.io/op/reference/instruction.v1.1.json');
  for (const rail of ['input', 'output', 'error', 'trait']) {
    const operation = { id: 'update', comment: '', input: [], output: [], error: [], trait: [] };
    operation[rail] = [term({ nullable: true })];
    const instruction = { id: 'test', comment: '', version: '1.1.0', operations: [operation], trait: [] };
    assert.equal(validate(instruction), true, JSON.stringify(validate.errors));
    operation[rail][0].nullable = 'true';
    assert.equal(validate(instruction), false);
  }
  assert.equal(validate({ id: 'test', comment: '', operations: [], trait: [] }), false);
});

for (const required of [false, true]) {
  for (const nullable of [false, true]) {
    test(`candidate accepts required=${required}, nullable=${nullable}`, () => {
      const document = [term({ required, nullable })];
      assert.equal(candidate(document), true, JSON.stringify(candidate.errors));
      assert.deepEqual(JSON.parse(JSON.stringify(document)), document);
    });
  }
}

for (const invalid of [null, 'true', 0, [], {}]) {
  test(`candidate rejects nullable=${JSON.stringify(invalid)}`, () => {
    assert.equal(candidate([term({ nullable: invalid })]), false);
  });
}

test('candidate accepts a legacy term without nullable without mutating it', () => {
  const document = [term()];
  const before = structuredClone(document);
  assert.equal(candidate(document), true);
  assert.deepEqual(document, before);
});

test('candidate validates nullable recursively inside objects and traits', () => {
  assert.equal(candidate([term({ kind: 'object', of: [term({ nullable: true })] })]), true);
  assert.equal(candidate([term({ kind: 'object', of: [term({ nullable: 'true' })] })]), false);
  assert.equal(candidate([term({ trait: [term({ nullable: 'true' })] })]), false);
});

test('legacy schema accepts even malformed nullable as an unknown property', () => {
  assert.equal(legacy([term({ nullable: 'not-a-boolean' })]), true);
  assert.equal(candidate([term({ nullable: 'not-a-boolean' })]), false);
});

// Restricted projection to JSON Schema for a single string member, not an OP compiler.
for (const required of [false, true]) {
  for (const nullable of [false, true]) {
    test(`payload states: required=${required}, nullable=${nullable}`, () => {
      const validate = ajv.compile({
        type: 'object',
        properties: { name: { type: nullable ? ['string', 'null'] : 'string' } },
        required: required ? ['name'] : [],
      });
      assert.equal(validate({}), !required);
      assert.equal(validate({ name: null }), nullable);
      assert.equal(validate({ name: '' }), true);
      assert.equal(validate({ name: 'Ruslan' }), true);
      for (const value of [false, 0, [], {}]) {
        assert.equal(validate({ name: value }), false);
      }
    });
  }
}
