"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[2637],{1208:(e,t,n)=>{n.d(t,{A:()=>a});n(3696);var r=n(2689);const s={tabItem:"tabItem_wHwb"};var i=n(2540);function a(e){let{children:t,hidden:n,className:a}=e;return(0,i.jsx)("div",{role:"tabpanel",className:(0,r.A)(s.tabItem,a),hidden:n,children:t})}},9515:(e,t,n)=>{n.d(t,{A:()=>g});var r=n(3696),s=n(2689),i=n(3447),a=n(9519),c=n(6960),o=n(9624),l=n(6953),u=n(9866);function h(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function d(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??function(e){return h(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:s}}=e;return{value:t,label:n,attributes:r,default:s}}))}(n);return function(e){const t=(0,l.XI)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function p(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function m(e){let{queryString:t=!1,groupId:n}=e;const s=(0,a.W6)(),i=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,o.aZ)(i),(0,r.useCallback)((e=>{if(!i)return;const t=new URLSearchParams(s.location.search);t.set(i,e),s.replace({...s.location,search:t.toString()})}),[i,s])]}function f(e){const{defaultValue:t,queryString:n=!1,groupId:s}=e,i=d(e),[a,o]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!p({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:i}))),[l,h]=m({queryString:n,groupId:s}),[f,x]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[s,i]=(0,u.Dv)(n);return[s,(0,r.useCallback)((e=>{n&&i.set(e)}),[n,i])]}({groupId:s}),y=(()=>{const e=l??f;return p({value:e,tabValues:i})?e:null})();(0,c.A)((()=>{y&&o(y)}),[y]);return{selectedValue:a,selectValue:(0,r.useCallback)((e=>{if(!p({value:e,tabValues:i}))throw new Error(`Can't select invalid tab value=${e}`);o(e),h(e),x(e)}),[h,x,i]),tabValues:i}}var x=n(9244);const y={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var b=n(2540);function j(e){let{className:t,block:n,selectedValue:r,selectValue:a,tabValues:c}=e;const o=[],{blockElementScrollPositionUntilNextRender:l}=(0,i.a_)(),u=e=>{const t=e.currentTarget,n=o.indexOf(t),s=c[n].value;s!==r&&(l(t),a(s))},h=e=>{let t=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const n=o.indexOf(e.currentTarget)+1;t=o[n]??o[0];break}case"ArrowLeft":{const n=o.indexOf(e.currentTarget)-1;t=o[n]??o[o.length-1];break}}t?.focus()};return(0,b.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.A)("tabs",{"tabs--block":n},t),children:c.map((e=>{let{value:t,label:n,attributes:i}=e;return(0,b.jsx)("li",{role:"tab",tabIndex:r===t?0:-1,"aria-selected":r===t,ref:e=>o.push(e),onKeyDown:h,onClick:u,...i,className:(0,s.A)("tabs__item",y.tabItem,i?.className,{"tabs__item--active":r===t}),children:n??t},t)}))})}function S(e){let{lazy:t,children:n,selectedValue:i}=e;const a=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=a.find((e=>e.props.value===i));return e?(0,r.cloneElement)(e,{className:(0,s.A)("margin-top--md",e.props.className)}):null}return(0,b.jsx)("div",{className:"margin-top--md",children:a.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==i})))})}function q(e){const t=f(e);return(0,b.jsxs)("div",{className:(0,s.A)("tabs-container",y.tabList),children:[(0,b.jsx)(j,{...t,...e}),(0,b.jsx)(S,{...t,...e})]})}function g(e){const t=(0,x.A)();return(0,b.jsx)(q,{...e,children:h(e.children)},String(t))}},8961:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>l,default:()=>p,frontMatter:()=>o,metadata:()=>r,toc:()=>h});const r=JSON.parse('{"id":"authorization/qraft-secure-request-fn","title":"QraftSecureRequestFn","description":"The ` component is used to provide SecurityScheme` handlers.","source":"@site/docs/authorization/qraft-secure-request-fn.mdx","sourceDirName":"authorization","slug":"/authorization/qraft-secure-request-fn","permalink":"/openapi-qraft/docs/authorization/qraft-secure-request-fn","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/authorization/qraft-secure-request-fn.mdx","tags":[],"version":"current","sidebarPosition":10,"frontMatter":{"sidebar_position":10,"sidebar_label":"<QraftSecureRequestFn />"},"sidebar":"mainDocsSidebar","previous":{"title":"POST, PUT, PATCH, DELETE","permalink":"/openapi-qraft/docs/core/mutation-operation"},"next":{"title":"Bearer Authentication","permalink":"/openapi-qraft/docs/authorization/bearer-authentication"}}');var s=n(2540),i=n(3023),a=n(9515),c=n(1208);const o={sidebar_position:10,sidebar_label:"<QraftSecureRequestFn />"},l="QraftSecureRequestFn",u={},h=[{value:"Properties",id:"properties",level:3},{value:"Security Scheme Handler",id:"security-scheme-handler",level:2},{value:"Properties",id:"properties-1",level:3},{value:"Returns",id:"returns",level:3},{value:"Supported Security Schemes",id:"supported-security-schemes",level:2},{value:"Example",id:"example",level:2}];function d(e){const t={a:"a",admonition:"admonition",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",header:"header",input:"input",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(t.header,{children:(0,s.jsx)(t.h1,{id:"qraftsecurerequestfn",children:(0,s.jsx)(t.code,{children:"QraftSecureRequestFn"})})}),"\n",(0,s.jsxs)(t.p,{children:["The ",(0,s.jsx)(t.code,{children:"<QraftSecureRequestFn />"})," component is used to provide ",(0,s.jsx)(t.code,{children:"SecurityScheme"})," handlers.\nThese handlers extend the ",(0,s.jsx)(t.code,{children:"requestFn"})," function to create a secured API client."]}),"\n",(0,s.jsxs)(t.p,{children:["See the ",(0,s.jsx)(t.a,{href:"https://swagger.io/docs/specification/authentication/",children:"OpenAPI Authentication \ud83d\udd17"})," specification for more information."]}),"\n",(0,s.jsx)(t.admonition,{type:"warning",children:(0,s.jsx)(t.p,{children:"This feature is still in the experimental stage \ud83e\uddea and may change in the future."})}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-tsx",children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft CLI\nimport { requestFn } from '@openapi-qraft/react';\nimport { QraftSecureRequestFn } from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';\n\nconst QraftAPIClientContext = createContext<ReturnType<typeof createAPIClient>>(null!);\n\nfunction App() {\n  <QraftSecureRequestFn\n    requestFn={requestFn}\n    securitySchemes={securitySchemes}\n  >\n    {(secureRequestFn) => (\n      <QraftAPIClientContext.Provider value={\n        createAPIClient({ requestFn: secureRequestFn, baseUrl, queryClient })\n      }>\n        <MyApp />\n      </QraftAPIClientContext.Provider>\n    )}\n  </QraftSecureRequestFn>\n}\n"})}),"\n",(0,s.jsx)(t.h3,{id:"properties",children:"Properties"}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"requestFn: requestFn(requestScheme, requestInfo) => Promise<T>"})," - ",(0,s.jsx)(t.strong,{children:"Required"})," requests function to be secured."]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"securitySchemes: { [key: string]: SecuritySchemeHandler }"})," - ",(0,s.jsx)(t.strong,{children:"Required"}),". Handlers for security schemes used in secure requests.","\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.strong,{children:"Key"}),": The name of the ",(0,s.jsx)(t.a,{href:"https://swagger.io/docs/specification/authentication/",children:(0,s.jsx)(t.code,{children:"SecurityScheme"})}),"."]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.strong,{children:"Value"}),": The corresponding ",(0,s.jsx)(t.code,{children:"SecuritySchemeHandler"}),"."]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.em,{children:"Note"}),": You can specify multiple security scheme handlers. If an operation specifies multiple security schemes, ",(0,s.jsx)(t.strong,{children:"the first defined handler will be used"}),"."]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"queryClient?: QueryClient"})," - ",(0,s.jsx)(t.strong,{children:"Optional"})," ",(0,s.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,s.jsx)(t.em,{children:"QueryClient \ud83c\udf34"})}),"\nto be used for security scheme handlers.\nThis query client will not be used for usual requests, only for security scheme handlers."]}),"\n"]}),"\n",(0,s.jsx)(t.admonition,{type:"tip",children:(0,s.jsxs)(t.p,{children:["Under the hood, the ",(0,s.jsx)(t.code,{children:"QraftSecureRequestFn"})," component handles initial auth request and updates the token if necessary.\nIt automatically detects the JWT expiration, or you can specify the refresh using the ",(0,s.jsx)(t.code,{children:"refreshInterval"})," property."]})}),"\n",(0,s.jsx)(t.h2,{id:"security-scheme-handler",children:"Security Scheme Handler"}),"\n",(0,s.jsxs)(t.p,{children:["A ",(0,s.jsx)(t.code,{children:"SecuritySchemeHandler"})," is a function that returns a ",(0,s.jsx)(t.code,{children:"SecurityScheme"})," object or a promise that resolves to it.\nEach handler must return specific data based on the security scheme type, which is used to authenticate requests."]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-ts",children:"function securitySchemeHandler(props: {\n  isRefreshing: boolean;\n  signal: AbortSignal;\n}) : SecurityScheme | Promise<SecurityScheme>\n"})}),"\n",(0,s.jsx)(t.h3,{id:"properties-1",children:"Properties"}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"isRefreshing: boolean"})," - A flag indicating whether the security scheme is being refreshed."]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"signal: AbortSignal"})," - An optional ",(0,s.jsx)(t.code,{children:"AbortSignal"})," to cancel the request. Usually, it is used to cancel the refresh request."]}),"\n"]}),"\n",(0,s.jsx)(t.h3,{id:"returns",children:"Returns"}),"\n",(0,s.jsxs)(t.p,{children:["The handler must return a ",(0,s.jsx)(t.code,{children:"SecurityScheme"})," object or a promise that resolves to it.\nThe ",(0,s.jsx)(t.code,{children:"SecurityScheme"})," is a union of the following types:"]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-ts",children:"type SecurityScheme =\n  | SecuritySchemeBearer\n  | SecuritySchemeBasic\n  | SecuritySchemeAPIKey\n  | SecuritySchemeCookie;\n"})}),"\n",(0,s.jsx)(t.h2,{id:"supported-security-schemes",children:"Supported Security Schemes"}),"\n",(0,s.jsxs)(t.ul,{className:"contains-task-list",children:["\n",(0,s.jsxs)(t.li,{className:"task-list-item",children:[(0,s.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,s.jsx)(t.a,{href:"/openapi-qraft/docs/authorization/bearer-authentication",children:"Bearer"})]}),"\n",(0,s.jsxs)(t.li,{className:"task-list-item",children:[(0,s.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,s.jsx)(t.a,{href:"/openapi-qraft/docs/authorization/api-key-authentication",children:"API Key"})]}),"\n",(0,s.jsxs)(t.li,{className:"task-list-item",children:[(0,s.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,s.jsx)(t.a,{href:"/openapi-qraft/docs/authorization/basic-authentication",children:"Basic"})]}),"\n",(0,s.jsxs)(t.li,{className:"task-list-item",children:[(0,s.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,s.jsx)(t.a,{href:"/openapi-qraft/docs/authorization/cookie-authentication",children:"Cookie"})]}),"\n",(0,s.jsxs)(t.li,{className:"task-list-item",children:[(0,s.jsx)(t.input,{type:"checkbox",disabled:!0})," ","OAuth2 (",(0,s.jsx)(t.em,{children:(0,s.jsx)(t.a,{href:"https://github.com/OpenAPI-Qraft/openapi-qraft/issues/new",children:"create an issue"})}),")"]}),"\n"]}),"\n",(0,s.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,s.jsxs)(t.p,{children:["In this example, the ",(0,s.jsx)(t.code,{children:"mySecurityScheme"})," security scheme handler is used to obtain and refresh the JWT Bearer token:"]}),"\n",(0,s.jsxs)(a.A,{children:[(0,s.jsx)(c.A,{value:"1. Open API Document",children:(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-yaml",children:"openapi: 3.1.0\nsecuritySchemes:\n  mySecurityScheme: # \u2b05\ufe0e Define security scheme\n    type: http\n    scheme: bearer\n    bearerFormat: JWT\npaths:\n  /pet:\n    post:\n      security:\n        - mySecurityScheme: [] # \u2b05\ufe0e Use specified security scheme for this operation\n      responses:\n        200:\n          content:\n            application/json:\n              schema:\n                $ref: '#/components/schemas/Pet'\n      requestBody:\n        content:\n          application/json:\n            schema:\n              $ref: '#/components/schemas/Pet'\n# ...\n"})})}),(0,s.jsx)(c.A,{value:"2. React",default:!0,children:(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-tsx",children:"import { QraftSecureRequestFn } from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';\nimport { requestFn } from '@openapi-qraft/react';\nimport { createAPIClient } from './api'; // generated by OpenAPI Qraft CLI\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nimport { useMemo, createContext, type ReactNode } from 'react';\n\nconst App = ({ children }: { children: ReactNode }) => {\n  const queryClient = useMemo(() => new QueryClient(), []);\n\n  return (\n    <QueryClientProvider client={queryClient}>\n      <QraftSecureRequestFn\n        requestFn={requestFn}\n        securitySchemes={{\n          async mySecurityScheme({isRefreshing}) {\n            return isRefreshing ? 'TEST_UNSECURE.NEW_BEARER.TOKEN' : 'TEST_UNSECURE.BEARER.TOKEN';\n          }\n        }}\n      >\n        {(secureRequestFn) => {\n          // When using `secureRequestFn`, all requests that require the specified security scheme\n          // will automatically include the appropriate authentication mechanism.\n          //\n          // For the `mySecurityScheme` security scheme, the initial request will use the provided token.\n          // If the token needs refreshing (`isRefreshing` is true), a new token will be used.\n          const api = createAPIClient({\n            queryClient,\n            requestFn: secureRequestFn,\n            baseUrl: 'https://petstore3.swagger.io/api/v3',\n          });\n\n          return (\n            <MyAPIContext.Provider value={api}>\n              {children}\n            </MyAPIContext.Provider>\n          )\n        }}\n      </QraftSecureRequestFn>\n    </QueryClientProvider>\n  );\n};\n\nconst MyAPIContext = createContext<ReturnType<typeof createAPIClient>>(null!);\n\nexport default App;\n"})})})]})]})}function p(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},3023:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>c});var r=n(3696);const s={},i=r.createContext(s);function a(e){const t=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),r.createElement(i.Provider,{value:t},e.children)}}}]);