"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[6541],{1044:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>o,default:()=>h,frontMatter:()=>s,metadata:()=>i,toc:()=>u});const i=JSON.parse('{"id":"authorization/basic-authentication","title":"Basic Authentication","description":"The SecuritySchemeBasic type is used for basic authentication, where credentials are required.","source":"@site/docs/authorization/basic-authentication.mdx","sourceDirName":"authorization","slug":"/authorization/basic-authentication","permalink":"/openapi-qraft/docs/next/authorization/basic-authentication","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/authorization/basic-authentication.mdx","tags":[],"version":"current","sidebarPosition":30,"frontMatter":{"sidebar_position":30},"sidebar":"mainDocsSidebar","previous":{"title":"API Key Authentication","permalink":"/openapi-qraft/docs/next/authorization/api-key-authentication"},"next":{"title":"Cookie Authentication","permalink":"/openapi-qraft/docs/next/authorization/cookie-authentication"}}');var r=t(2540),a=t(3023);const s={sidebar_position:30},o="Basic Authentication",c={},u=[{value:"Example",id:"example",level:3}];function l(e){const n={a:"a",code:"code",h1:"h1",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"basic-authentication",children:"Basic Authentication"})}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.code,{children:"SecuritySchemeBasic"})," type is used for basic authentication, where credentials are required."]}),"\n",(0,r.jsxs)(n.p,{children:["See the ",(0,r.jsx)(n.a,{href:"https://swagger.io/docs/specification/authentication/basic-authentication/",children:"OpenAPI Basic Authentication \ud83d\udd17"})," specification for more information."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"type SecuritySchemeBasic = {\n  /** Credentials to be used for authentication. */\n  credentials: string;\n\n  /** Refresh interval in milliseconds. */\n  refreshInterval: number;\n}\n"})}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Credentials"}),": A string representing the username and password encoded in Base64."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Refresh Interval"}),": The interval (in milliseconds) at which the key should be refreshed."]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"import { QraftSecureRequestFn } from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';\nimport { requestFn } from '@openapi-qraft/react';\nimport { createAPIClient } from './api'; // generated by OpenAPI Qraft CLI\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nimport { useMemo, createContext, type ReactNode } from 'react';\n\nconst App = ({ children }: { children: ReactNode }) => {\n  const queryClient = useMemo(() => new QueryClient(), []);\n\n  return (\n    <QueryClientProvider client={queryClient}>\n      <QraftSecureRequestFn\n        requestFn={requestFn}\n        securitySchemes={{\n          basicAuth: () => {\n            // Function to prompt user for basic authentication credentials\n            const username = prompt('Enter your username:');\n            const password = prompt('Enter your password:');\n            return {\n              credentials: btoa(`${username}:${password}`),\n              // Ask for credentials just once or specify the refresh interval in milliseconds.\n              refreshInterval: Infinity,\n            };\n          }\n        }}\n      >\n        {(secureRequestFn) => {\n          const api = createAPIClient({\n            queryClient,\n            requestFn: secureRequestFn,\n            baseUrl: 'https://petstore3.swagger.io/api/v3',\n          });\n\n          // When using `secureRequestFn`, the first request that requires the `basicAuth` security scheme\n          // will prompt the user for their username and password. These credentials are then encoded in\n          // Base64 format and included in the `Authorization: Basic <credentials>` header for subsequent requests.\n          // This ensures that the requests are authenticated using Basic Authentication.\n          // The credentials will be asked just once, and all following requests will reuse the entered credentials.\n          return (\n            <MyAPIContext.Provider value={api}>\n              {children}\n            </MyAPIContext.Provider>\n          )\n        }}\n      </QraftSecureRequestFn>\n    </QueryClientProvider>\n  );\n};\n\nconst MyAPIContext = createContext<ReturnType<typeof createAPIClient>>(null!);\n\nexport default App;\n"})})]})}function h(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(l,{...e})}):l(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>s,x:()=>o});var i=t(3696);const r={},a=i.createContext(r);function s(e){const n=i.useContext(a);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:s(e.components),i.createElement(a.Provider,{value:n},e.children)}}}]);