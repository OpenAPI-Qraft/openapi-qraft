import { RuleTester } from '@typescript-eslint/rule-tester';
import { rule } from '../rules/no-rest-destructuring/no-rest-destructuring.rule';
import { normalizeIndent } from './test-utils';

const ruleTester = new RuleTester();

ruleTester.run('no-rest-destructuring', rule, {
  valid: [
    {
      name: 'useQuery is not captured',
      code: normalizeIndent`
        function Component() {
          qraft.service.operation.useQuery()
          return
        }
      `,
    },
    {
      name: 'useQuery is not captured',
      code: normalizeIndent`
        function Component() {
          qraft.operation.useQuery()
          return
        }
      `,
    },
    {
      name: 'useQuery is not captured',
      code: normalizeIndent`
        function Component() {
          qraft.useQuery()
          return
        }
      `,
    },
    {
      name: 'useQuery is not destructured',
      code: normalizeIndent`
          function Component() {
            const query = qraft.service.operation.useQuery()
            return
          }
        `,
    },
    {
      name: 'useQuery is not destructured',
      code: normalizeIndent`
          function Component() {
            const query = qraft.operation.useQuery()
            return
          }
        `,
    },
    {
      name: 'useQuery is not destructured',
      code: normalizeIndent`
          function Component() {
            const query = qraft.useQuery()
            return
          }
        `,
    },
    {
      name: 'useQuery is destructured without rest',
      code: normalizeIndent`
          function Component() {
            const { data, isLoading, isError } = qraft.service.operation.useQuery()
            return
          }
        `,
    },
    {
      name: 'useQuery is destructured without rest',
      code: normalizeIndent`
          function Component() {
            const { data, isLoading, isError } = qraft.operation.useQuery()
            return
          }
        `,
    },
    {
      name: 'useQuery is destructured without rest',
      code: normalizeIndent`
          function Component() {
            const { data, isLoading, isError } = qraft.useQuery()
            return
          }
        `,
    },
    {
      name: 'useInfiniteQuery is not captured',
      code: normalizeIndent`
        function Component() {
          qraft.service.operation.useInfiniteQuery()
          return
        }
      `,
    },
    {
      name: 'useInfiniteQuery is not captured',
      code: normalizeIndent`
        function Component() {
          qraft.useInfiniteQuery()
          return
        }
      `,
    },
    {
      name: 'useInfiniteQuery is not destructured',
      code: normalizeIndent`
          function Component() {
            const query = qraft.service.operation.useInfiniteQuery()
            return
          }
        `,
    },
    {
      name: 'useInfiniteQuery is destructured without rest',
      code: normalizeIndent`
          function Component() {
            const { data, isLoading, isError } = qraft.useInfiniteQuery()
            return
          }
        `,
    },
    {
      name: 'useQueries is not captured',
      code: normalizeIndent`
        function Component() {
          qraft.service.operation.useQueries([])
          return
        }
      `,
    },
    {
      name: 'useQueries is not destructured',
      code: normalizeIndent`
          function Component() {
            const queries = qraft.useQueries([])
            return
          }
        `,
    },
    {
      name: 'useQueries array has no rest destructured element',
      code: normalizeIndent`
          function Component() {
            const [query1, { data, isLoading },, ...others] = qraft.service.operation.useQueries([
              { queryKey: ['key1'], queryFn: () => {} },
              { queryKey: ['key2'], queryFn: () => {} },
              { queryKey: ['key3'], queryFn: () => {} },
              { queryKey: ['key4'], queryFn: () => {} },
              { queryKey: ['key5'], queryFn: () => {} },
            ])
            return
          }
        `,
    },
    {
      name: 'useQuery is destructured with rest but not from Qraft',
      code: normalizeIndent`
        function Component() {
          const { data, ...rest } = otherLibrary.useQuery()
          return
        }
      `,
    },
    {
      name: 'useInfiniteQuery is destructured with rest but not from Qraft',
      code: normalizeIndent`
        function Component() {
          const { data, ...rest } = otherLibrary.useInfiniteQuery()
          return
        }
      `,
    },
    {
      name: 'useQueries array has rest destructured element but not from Qraft',
      code: normalizeIndent`
          import { useQueries } from 'other-package'

          function Component() {
            const [query1, { data, ...rest }] = otherLibrary.useQueries([
              { queryKey: ['key1'], queryFn: () => {} },
              { queryKey: ['key2'], queryFn: () => {} },
            ])
            return
          }
        `,
    },
    {
      name: 'useSuspenseQuery is not captured',
      code: normalizeIndent`
        function Component() {
          qraft.service.operation.useSuspenseQuery()
          return
        }
      `,
    },
    {
      name: 'useSuspenseQuery is not destructured',
      code: normalizeIndent`
        function Component() {
          const query = qraft.useSuspenseQuery()
          return
        }
      `,
    },
    {
      name: 'useSuspenseQuery is destructured without rest',
      code: normalizeIndent`
        function Component() {
          const { data, isLoading, isError } = qraft.service.operation.useSuspenseQuery()
          return
        }
      `,
    },
    {
      name: 'useSuspenseInfiniteQuery is not captured',
      code: normalizeIndent`
        function Component() {
          qraft.service.operation.useSuspenseInfiniteQuery()
          return
        }
      `,
    },
    {
      name: 'useSuspenseInfiniteQuery is not destructured',
      code: normalizeIndent`
        function Component() {
          const query = qraft.useSuspenseInfiniteQuery()
          return
        }
      `,
    },
    {
      name: 'useSuspenseInfiniteQuery is destructured without rest',
      code: normalizeIndent`
        function Component() {
          const { data, isLoading, isError } = qraft.service.operation.useSuspenseInfiniteQuery()
          return
        }
      `,
    },
    {
      name: 'useSuspenseQueries is not captured',
      code: normalizeIndent`
        function Component() {
          qraft.useSuspenseQueries([])
          return
        }
      `,
    },
    {
      name: 'useSuspenseQueries is not destructured',
      code: normalizeIndent`
        function Component() {
          const queries = qraft.service.operation.useSuspenseQueries([])
          return
        }
      `,
    },
    {
      name: 'useSuspenseQueries array has no rest destructured element',
      code: normalizeIndent`
        function Component() {
          const [query1, { data, isLoading }] = qraft.service.operation.useSuspenseQueries([
            { queryKey: ['key1'], queryFn: () => {} },
            { queryKey: ['key2'], queryFn: () => {} },
          ])
          return
        }
      `,
    },
    {
      name: 'useSuspenseQuery is destructured with rest but not from Qraft',
      code: normalizeIndent`
        function Component() {
          const { data, ...rest } = otherLibrary.useSuspenseQuery()
          return
        }
      `,
    },
    {
      name: 'useSuspenseInfiniteQuery is destructured with rest but not from Qraft',
      code: normalizeIndent`
        function Component() {
          const { data, ...rest } = otherLibrary.useSuspenseInfiniteQuery()
          return
        }
      `,
    },
    {
      name: 'useSuspenseQueries array has rest destructured element but not from Qraft',
      code: normalizeIndent`
        function Component() {
          const [query1, { data, ...rest }] = otherLibrary.useSuspenseQueries([
            { queryKey: ['key1'], queryFn: () => {} },
            { queryKey: ['key2'], queryFn: () => {} },
          ])
          return
        }
      `,
    },
  ],
  invalid: [
    {
      name: 'useQuery is destructured with rest',
      code: normalizeIndent`
        function Component() {
          const { data, ...rest } = qraft.service.operation.useQuery()
          return
        }
      `,
      errors: [{ messageId: 'objectRestDestructure' }],
    },
    {
      name: 'useQuery is destructured with rest',
      code: normalizeIndent`
        function Component() {
          const { data, ...rest } = qraft.operation.useQuery()
          return
        }
      `,
      errors: [{ messageId: 'objectRestDestructure' }],
    },
    {
      name: 'useQuery is destructured with rest',
      code: normalizeIndent`
        function Component() {
          const { data, ...rest } = qraft.useQuery()
          return
        }
      `,
      errors: [{ messageId: 'objectRestDestructure' }],
    },
    {
      name: 'useInfiniteQuery is destructured with rest',
      code: normalizeIndent`
        function Component() {
          const { data, ...rest } = qraft.service.operation.useInfiniteQuery()
          return
        }
      `,
      errors: [{ messageId: 'objectRestDestructure' }],
    },
    {
      name: 'useQueries array has rest destructured element',
      code: normalizeIndent`
          function Component() {
            const [query1, { data, ...rest }] = qraft.service.operation.useQueries([
              { queryKey: ['key1'], queryFn: () => {} },
              { queryKey: ['key2'], queryFn: () => {} },
            ])
            return
          }
        `,
      errors: [{ messageId: 'objectRestDestructure' }],
    },
    {
      name: 'useSuspenseQuery is destructured with rest',
      code: normalizeIndent`
        function Component() {
          const { data, ...rest } = qraft.service.operation.useSuspenseQuery()
          return
        }
      `,
      errors: [{ messageId: 'objectRestDestructure' }],
    },
    {
      name: 'useSuspenseInfiniteQuery is destructured with rest',
      code: normalizeIndent`
        function Component() {
          const { data, ...rest } = qraft.service.operation.useSuspenseInfiniteQuery()
          return
        }
      `,
      errors: [{ messageId: 'objectRestDestructure' }],
    },
    {
      name: 'useSuspenseQueries is destructured with rest',
      code: normalizeIndent`
        function Component() {
          const [query1, { data, ...rest }] = qraft.service.operation.useSuspenseQueries([
            { queryKey: ['key1'], queryFn: () => {} },
            { queryKey: ['key2'], queryFn: () => {} },
          ])
          return
        }
      `,
      errors: [{ messageId: 'objectRestDestructure' }],
    },
    {
      name: 'useQuery result is spread in return statement',
      code: normalizeIndent`
        function Component() {
          const query = qraft.service.operation.useQuery()
          return { ...query, data: query.data[0] }
        }
      `,
      errors: [{ messageId: 'objectRestDestructure' }],
    },
    {
      name: 'useQuery result is spread in object expression',
      code: normalizeIndent`
        function Component() {
          const query = qraft.service.operation.useQuery()
          const result = { ...query, data: query.data[0] }
          return result
        }
      `,
      errors: [{ messageId: 'objectRestDestructure' }],
    },
  ],
});
