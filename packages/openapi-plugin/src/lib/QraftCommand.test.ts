import type { OpenAPISchemaType } from './open-api/OpenAPISchemaType.js';
import type { QraftCommandActionCallback } from './QraftCommand.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readSchema } from './open-api/readSchema.js';
import { QraftCommand, splitOptionFlags } from './QraftCommand.js';
import { writeGeneratorFiles } from '@qraft/plugin/lib/writeGeneratorFiles';

vi.mock('./open-api/readSchema.js');
vi.mock('@qraft/plugin/lib/writeGeneratorFiles');

describe('QraftCommand', () => {
  it('merges options with similar flags and input', () => {
    const command = new QraftCommand();

    command.option('-m,--mixed <value>', 'A mixed option');
    command.option('-m,--mixed <value>', 'A mixed option');
    expect(
      command.options.filter((option) => option.flags === '-m,--mixed <value>')
    ).toHaveLength(1);
  });

  it('throws if similar option flags have different long names', () => {
    const command = new QraftCommand();

    command.option('-m,--dummy <value>', 'A mixed option');
    expect(() =>
      command.option('-m,--mixed <value>', 'A mixed option')
    ).toThrow(
      'Long flag -m,--mixed <value> already exists in the option list with flags: "-m,--dummy <value>" and description: "A mixed option"'
    );
  });

  it('throws if similar option flags have different short names', () => {
    const command = new QraftCommand();

    command.option('-d,--mixed <value>', 'A mixed option');
    expect(() =>
      command.option('-m,--mixed <value>', 'A mixed option')
    ).toThrow(
      'Short flag -m,--mixed <value> already exists in the option list with flags: "-d,--mixed <value>" and description: "A mixed option"'
    );
  });

  it('throws if similar option flags have partial inputs', () => {
    const command = new QraftCommand();

    command.option('-m,--mixed', 'A mixed option');

    expect(() =>
      command.option('-m,--mixed <value>', 'A mixed option')
    ).toThrow(
      'Flag -m,--mixed <value> already exists in the option list with flags: "-m,--mixed" and description: "A mixed option" but with different required status'
    );
  });

  it('throws if similar option flags have different inputs', () => {
    const command = new QraftCommand();

    command.option('-m,--mixed <value>', 'A mixed option');
    expect(() =>
      command.option('-m,--mixed [value]', 'A mixed option')
    ).toThrow(
      'Flag -m,--mixed [value] already exists in the option list with flags: "-m,--mixed <value>" and description: "A mixed option" but with different required status'
    );
  });

  it('throws if similar option flags have different mandatory', () => {
    const command = new QraftCommand();

    command.requiredOption('-m,--mixed <value>', 'A mixed option');
    expect(() =>
      command.option('-m,--mixed <value>', 'A mixed option')
    ).toThrow(
      'Flag -m,--mixed <value> already exists in the option list with flags: "-m,--mixed <value>" and description: "A mixed option" but with different mandatory status'
    );
  });

  it('throws if similar option flags have different variadic', () => {
    const command = new QraftCommand();

    command.option('-m,--mixed <value>', 'A mixed option');
    expect(() =>
      command.option('-m,--mixed <value...>', 'A mixed option')
    ).toThrow(
      'Flag -m,--mixed <value...> already exists in the option list with flags: "-m,--mixed <value>" and description: "A mixed option" but with different variadic status'
    );
  });

  describe('splitOptionFlags(...)', () => {
    it('should split short and long flags with input', () => {
      expect(splitOptionFlags('-m,--mixed <value>')).toEqual({
        shortFlag: '-m',
        longFlag: '--mixed',
      });
    });

    it('should split short and long flags without input', () => {
      expect(splitOptionFlags('-m,--mixed')).toEqual({
        shortFlag: '-m',
        longFlag: '--mixed',
      });
    });

    it('should remove extra flags', () => {
      expect(splitOptionFlags('-m,--mixed,-a,--all')).toEqual({
        shortFlag: '-m',
        longFlag: '--mixed',
      });
    });
  });

  describe('final operation name validation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(QraftCommand.spinner, 'start').mockReturnThis();
      vi.spyOn(QraftCommand.spinner, 'succeed').mockReturnThis();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('rejects normalized operationId collisions before generation or writes', async () => {
      vi.mocked(readSchema).mockResolvedValue(
        createSchema({
          '/items': {
            get: { operationId: 'getItems', responses: { default: {} } },
          },
          '/items/search': {
            post: { operationId: 'get_items', responses: { default: {} } },
          },
        })
      );
      const pluginAction = vi.fn<QraftCommandActionCallback>(
        async (_options, resolve) => resolve([])
      );
      const command = new QraftCommand().action(pluginAction);

      await expect(
        command.actionCallback('schema.json', {
          outputDir: '/generated',
          clean: true,
        })
      ).rejects.toThrow(
        'Operation name collision in service "items" for normalized name "getItems": GET /items, POST /items/search.'
      );

      expect(pluginAction).not.toHaveBeenCalled();
      expect(writeGeneratorFiles).not.toHaveBeenCalled();
    });

    it('rejects a modifier collision with an unchanged operation name', async () => {
      vi.mocked(readSchema).mockResolvedValue(
        createSchema({
          '/items': {
            get: { operationId: 'getItems', responses: { default: {} } },
          },
          '/items/search': {
            post: { operationId: 'searchItems', responses: { default: {} } },
          },
        })
      );
      const pluginAction = vi.fn<QraftCommandActionCallback>(
        async (_options, resolve) => resolve([])
      );
      const command = new QraftCommand().action(pluginAction);

      await expect(
        command.actionCallback('schema.json', {
          outputDir: '/generated',
          operationNameModifier: '/items/search:searchItems ==> get_items',
        })
      ).rejects.toThrow(
        'Operation name collision in service "items" for normalized name "getItems": GET /items, POST /items/search.'
      );

      expect(pluginAction).not.toHaveBeenCalled();
      expect(writeGeneratorFiles).not.toHaveBeenCalled();
    });

    it('allows modifiers to repair an original normalized name collision', async () => {
      vi.mocked(readSchema).mockResolvedValue(
        createSchema({
          '/items': {
            get: { operationId: 'getItems', responses: { default: {} } },
          },
          '/items/search': {
            post: { operationId: 'get_items', responses: { default: {} } },
          },
        })
      );
      const pluginAction = vi.fn<QraftCommandActionCallback>(
        async (_options, resolve) => resolve([])
      );
      const command = new QraftCommand().action(pluginAction);

      await command.actionCallback('schema.json', {
        outputDir: '/generated',
        operationNameModifier: '/items/search:getItems ==> searchItems',
      });

      expect(
        pluginAction.mock.calls[0][0].services[0].operations.map(
          ({ name }) => name
        )
      ).toEqual(['getItems', 'searchItems']);
      expect(writeGeneratorFiles).toHaveBeenCalledOnce();
    });

    it('allows the same normalized operation name in different services', async () => {
      vi.mocked(readSchema).mockResolvedValue(
        createSchema({
          '/items': {
            get: { operationId: 'getItems', responses: { default: {} } },
          },
          '/users': {
            get: { operationId: 'get_items', responses: { default: {} } },
          },
        })
      );
      const pluginAction = vi.fn<QraftCommandActionCallback>(
        async (_options, resolve) => resolve([])
      );
      const command = new QraftCommand().action(pluginAction);

      await command.actionCallback('schema.json', {
        outputDir: '/generated',
      });

      expect(
        pluginAction.mock.calls[0][0].services.flatMap(({ operations }) =>
          operations.map(({ name }) => name)
        )
      ).toEqual(['getItems', 'getItems']);
      expect(writeGeneratorFiles).toHaveBeenCalledOnce();
    });

    it('rejects operationIds that normalize to an empty name', async () => {
      vi.mocked(readSchema).mockResolvedValue(
        createSchema({
          '/items': { get: { operationId: '123', responses: { default: {} } } },
        })
      );
      const pluginAction = vi.fn<QraftCommandActionCallback>(
        async (_options, resolve) => resolve([])
      );
      const command = new QraftCommand().action(pluginAction);

      await expect(
        command.actionCallback('schema.json', { outputDir: '/generated' })
      ).rejects.toThrow(
        'Empty normalized operation name in service "items": GET /items.'
      );

      expect(pluginAction).not.toHaveBeenCalled();
      expect(writeGeneratorFiles).not.toHaveBeenCalled();
    });
  });
});

function createSchema(paths: OpenAPISchemaType['paths']): OpenAPISchemaType {
  return {
    openapi: '3.0.0',
    info: { title: 'Operation names', version: '1.0.0' },
    paths,
    components: { parameters: undefined },
  };
}
