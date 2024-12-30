"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[9653],{9373:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>a,default:()=>l,frontMatter:()=>s,metadata:()=>i,toc:()=>u});const i=JSON.parse('{"id":"authorization/cookie-authentication","title":"Cookie Authentication","description":"The SecuritySchemeCookie type is used for cookie-based authentication, where the secret is placed in a cookie.","source":"@site/docs/authorization/cookie-authentication.mdx","sourceDirName":"authorization","slug":"/authorization/cookie-authentication","permalink":"/openapi-qraft/docs/authorization/cookie-authentication","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/authorization/cookie-authentication.mdx","tags":[],"version":"current","sidebarPosition":30,"frontMatter":{"sidebar_position":30},"sidebar":"mainDocsSidebar","previous":{"title":"Basic Authentication","permalink":"/openapi-qraft/docs/authorization/basic-authentication"},"next":{"title":"useQuery()","permalink":"/openapi-qraft/docs/hooks/useQuery"}}');var r=n(2540),o=n(3023);const s={sidebar_position:30},a="Cookie Authentication",c={},u=[{value:"Example",id:"example",level:3}];function h(e){const t={a:"a",code:"code",h1:"h1",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,o.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.header,{children:(0,r.jsx)(t.h1,{id:"cookie-authentication",children:"Cookie Authentication"})}),"\n",(0,r.jsxs)(t.p,{children:["The ",(0,r.jsx)(t.code,{children:"SecuritySchemeCookie"})," type is used for cookie-based authentication, where the secret is placed in a cookie.\nYou can't specify the cookie name. The server must set the cookie."]}),"\n",(0,r.jsxs)(t.p,{children:["See the ",(0,r.jsx)(t.a,{href:"https://swagger.io/docs/specification/authentication/cookie-authentication/",children:"OpenAPI Cookie Authentication \ud83d\udd17"})," specification for more information."]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-ts",children:"type SecuritySchemeCookie = {\n  /** Where the secret should be placed. */\n  in: 'cookie';\n  /** Refresh interval in milliseconds. */\n  refreshInterval?: number;\n};\n"})}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Location"}),": Specifies that the secret is placed in a cookie."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Refresh Interval"}),": (Optional) The interval (in milliseconds) at which the key should be refreshed."]}),"\n"]}),"\n",(0,r.jsx)(t.h3,{id:"example",children:"Example"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",children:"import { QraftSecureRequestFn } from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';\nimport { requestFn } from '@openapi-qraft/react';\nimport { createAPIClient } from './api'; // generated by OpenAPI Qraft CLI\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nimport { useMemo, createContext, type ReactNode } from 'react';\n\nconst App = ({ children }: { children: ReactNode }) => {\n  const queryClient = useMemo(() => new QueryClient(), []);\n\n  return (\n    <QueryClientProvider client={queryClient}>\n      <QraftSecureRequestFn\n        requestFn={requestFn}\n        securitySchemes={{\n          cookieAuth: async ({isRefreshing}) => {\n            const api = createAPIClient({\n              requestFn,\n              baseUrl: 'https://petstore3.swagger.io/api/v3',\n            });\n\n            await api.auth.cookieAuth(\n              isRefreshing\n                ? { refresh: true }\n                : {\n                  username: 'UNSECURE_TEST_USERNAME',\n                  password: 'UNSECURE_TEST_PASSWORD',\n                },\n            );\n\n            return {\n              in: 'cookie',\n              refreshInterval: 3600_000, // 1 hour in milliseconds (optional)\n            };\n          },\n        }}\n      >\n        {(secureRequestFn) => {\n          // When using `secureRequestFn`, all requests that require the `cookieAuth` security scheme\n          // will ensure the necessary cookies for authentication are set by the server.\n          // The server is responsible for setting and updating the authentication cookie.\n          //\n          // The initial request will send the provided username and password to the server,\n          // which will respond by setting the authentication cookie. For subsequent requests,\n          // if the `isRefreshing` flag is true, a refresh request will be sent to update the cookie.\n          const api = createAPIClient({\n            queryClient,\n            requestFn: secureRequestFn,\n            baseUrl: 'https://petstore3.swagger.io/api/v3',\n          });\n\n          return (\n            <MyAPIContext.Provider value={api}>\n              {children}\n            </MyAPIContext.Provider>\n          )\n        }}\n      </QraftSecureRequestFn>\n    </QueryClientProvider>\n  );\n};\n\nconst MyAPIContext = createContext<ReturnType<typeof createAPIClient>>(null!);\n\nexport default App;\n"})})]})}function l(e={}){const{wrapper:t}={...(0,o.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},3023:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>a});var i=n(3696);const r={},o=i.createContext(r);function s(e){const t=i.useContext(o);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function a(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:s(e.components),i.createElement(o.Provider,{value:t},e.children)}}}]);