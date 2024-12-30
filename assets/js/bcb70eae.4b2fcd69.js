"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[4216],{1943:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>l,frontMatter:()=>s,metadata:()=>r,toc:()=>u});const r=JSON.parse('{"id":"authorization/api-key-authentication","title":"API Key Authentication","description":"The SecuritySchemeAPIKey type is used for API key authentication, where the key can be placed in different locations","source":"@site/docs/authorization/api-key-authentication.mdx","sourceDirName":"authorization","slug":"/authorization/api-key-authentication","permalink":"/openapi-qraft/docs/authorization/api-key-authentication","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/authorization/api-key-authentication.mdx","tags":[],"version":"current","sidebarPosition":25,"frontMatter":{"sidebar_position":25},"sidebar":"mainDocsSidebar","previous":{"title":"Bearer Authentication","permalink":"/openapi-qraft/docs/authorization/bearer-authentication"},"next":{"title":"Basic Authentication","permalink":"/openapi-qraft/docs/authorization/basic-authentication"}}');var i=n(2540),a=n(3023);const s={sidebar_position:25},o="API Key Authentication",c={},u=[{value:"Example",id:"example",level:3}];function h(e){const t={a:"a",code:"code",h1:"h1",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,a.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.header,{children:(0,i.jsx)(t.h1,{id:"api-key-authentication",children:"API Key Authentication"})}),"\n",(0,i.jsxs)(t.p,{children:["The ",(0,i.jsx)(t.code,{children:"SecuritySchemeAPIKey"})," type is used for API key authentication, where the key can be placed in different locations\nsuch as headers or query parameters."]}),"\n",(0,i.jsxs)(t.p,{children:["See the ",(0,i.jsx)(t.a,{href:"https://swagger.io/docs/specification/authentication/api-keys/",children:"OpenAPI API Key Authentication \ud83d\udd17"})," specification for more information."]}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-ts",children:"type SecuritySchemeAPIKey = {\n  /** Where the secret should be placed. */\n  in: 'header' | 'query';\n  /** Name of the secret key. */\n  name: string;\n  /** Secret to be used for authentication. */\n  value: string;\n  /** Refresh interval in milliseconds. */\n  refreshInterval?: number;\n};\n"})}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Location"}),": Specifies that the secret is placed in the header or query parameters."]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Name"}),": The name of the secret key."]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Value"}),": The secret key to be used for authentication."]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Refresh Interval"}),": (Optional) The interval (in milliseconds) at which the key should be refreshed."]}),"\n"]}),"\n",(0,i.jsx)(t.h3,{id:"example",children:"Example"}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-tsx",children:"import { QraftSecureRequestFn } from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';\nimport { requestFn } from '@openapi-qraft/react';\nimport { createAPIClient } from './api'; // generated by OpenAPI Qraft CLI\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nimport { useMemo, createContext, type ReactNode } from 'react';\n\nconst App = ({ children }: { children: ReactNode }) => {\n  const queryClient = useMemo(() => new QueryClient(), []);\n\n  return (\n    <QueryClientProvider client={queryClient}>\n      <QraftSecureRequestFn\n        requestFn={requestFn}\n        securitySchemes={{\n          apiClientSecret: async () => {\n            const api = createAPIClient({\n              requestFn,\n              baseUrl: 'https://petstore3.swagger.io/api/v3',\n            });\n\n            const { secret } = await api.auth.getAPISecret({ parameters: undefined }, requestFn);\n            return {\n              in: 'header', // specify the location of the secret, either 'header' or 'query'\n              name: 'X-API-Secret',\n              value: secret,\n              // Specify the refresh interval in milliseconds if needed, or use Infinity to ask for the secret just once\n              refreshInterval: Infinity,\n            };\n          }\n        }}\n      >\n        {(secureRequestFn) => {\n          // When using `secureRequestFn`, all requests that require the `apiClientSecret` security scheme\n          // will automatically include the `X-API-Secret: <secret>` header.\n          // This ensures that these requests are authenticated using the API Key Authentication mechanism.\n          const api = createAPIClient({\n            queryClient,\n            requestFn: secureRequestFn,\n            baseUrl: 'https://petstore3.swagger.io/api/v3',\n          });\n\n          return (\n            <MyAPIContext.Provider value={api}>\n              {children}\n            </MyAPIContext.Provider>\n          )\n        }}\n      </QraftSecureRequestFn>\n    </QueryClientProvider>\n  );\n};\n\nconst MyAPIContext = createContext<ReturnType<typeof createAPIClient>>(null!);\n\nexport default App;\n"})})]})}function l(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},3023:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>o});var r=n(3696);const i={},a=r.createContext(i);function s(e){const t=r.useContext(a);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:s(e.components),r.createElement(a.Provider,{value:t},e.children)}}}]);