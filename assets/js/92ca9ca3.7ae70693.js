"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[970],{1509:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>f,frontMatter:()=>i,metadata:()=>u,toc:()=>d});var r=n(2540),a=n(3023),o=n(8296),s=n(2491);const i={sidebar_position:1},l="QraftContext",u={id:"hooks/qraft-context",title:"QraftContext",description:"QraftContext is the default provider for the Qraft API client used to make requests using Hooks in React.",source:"@site/docs/hooks/qraft-context.mdx",sourceDirName:"hooks",slug:"/hooks/qraft-context",permalink:"/openapi-qraft/docs/hooks/qraft-context",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/hooks/qraft-context.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"mainDocsSidebar",previous:{title:"createAPIClient",permalink:"/openapi-qraft/docs/codegen/create-api-client-function"},next:{title:"useQuery",permalink:"/openapi-qraft/docs/hooks/useQuery"}},c={},d=[{value:"Context Value",id:"context-value",level:3},{value:"Examples",id:"examples",level:3}];function h(e){const t={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h1,{id:"qraftcontext",children:"QraftContext"}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.code,{children:"QraftContext"})," is the ",(0,r.jsx)(t.em,{children:"default"})," provider for the Qraft API client used to make requests using Hooks in React."]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",children:"<QraftContext.Provider\n  value={{\n    requestFn,\n    baseUrl,\n    queryClient,\n  }}\n  children={children}\n/>\n"})}),"\n",(0,r.jsx)(t.h3,{id:"context-value",children:"Context Value"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"requestFn: requestFn(requestSchema, requestInfo): Promise<T>"})," - ",(0,r.jsx)(t.strong,{children:"Required"})," function used to make requests"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"baseUrl: string"})," - ",(0,r.jsx)(t.strong,{children:"Required"})," base URL of the API to be used by ",(0,r.jsx)(t.code,{children:"requestFn"})]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"queryClient?: QueryClient"})," - ",(0,r.jsx)(t.strong,{children:"Optional"})," ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,r.jsx)(t.em,{children:"QueryClient \ud83c\udf34"})})," to be used in Qraft Hooks.\nIf not provided, ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useQueryClient",children:(0,r.jsx)(t.em,{children:"useQueryClient() \ud83c\udf34"})}),"\nresult will be used as a default ",(0,r.jsx)(t.em,{children:"QueryClient"}),"."]}),"\n"]}),"\n",(0,r.jsx)(t.h3,{id:"examples",children:"Examples"}),"\n",(0,r.jsxs)(o.A,{children:[(0,r.jsx)(s.A,{value:"default-request-fn",label:(0,r.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["Default ",(0,r.jsx)(t.code,{children:"requestFn"})]}),default:!0,children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",metastring:'title="src/APIClientProvider.tsx"',children:"import React from 'react';\nimport { QraftContext, requestFn } from '@openapi-qraft/react';\n\nexport default function ApplicationProviders({ children }: { children: React.ReactNode }) {\n  return (\n    <QraftContext.Provider\n      value={{\n        requestFn, // the request function to use, could be fully customized\n        baseUrl: 'https://petstore3.swagger.io/api/v3', // the base URL of the API\n      }}\n    >\n      {children}\n    </QraftContext.Provider>\n  );\n}\n"})})}),(0,r.jsxs)(s.A,{value:"custom-request-fn",label:(0,r.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["Custom ",(0,r.jsx)(t.code,{children:"Authorization"})]}),children:[(0,r.jsxs)(t.p,{children:["In this example, we are using a custom ",(0,r.jsx)(t.code,{children:"requestFn"})," to add an ",(0,r.jsx)(t.code,{children:"Authorization"})," header to the request.\nIn this way, you can customize the ",(0,r.jsx)(t.code,{children:"requestFn"})," to add any headers, credentials, cache, etc."]}),(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",metastring:'title="src/APIClientSecureProvider.tsx"',children:"import React from 'react';\nimport { QraftContext, requestFn } from '@openapi-qraft/react';\nimport { fetchToken } from './lib/fetchToken';\n\nexport default function ApplicationSecureProviders({ children }: { children: React.ReactNode }) {\n  return (\n    <QraftContext.Provider\n      value={{\n        // \u2b07\ufe0e the `requestFn` will be called for each request\n        requestFn: async (requestSchema, requestInfo) => {\n          // \u2b07\ufe0e make any async request inside the `requestFn`\n          const token = await fetchToken();\n\n          return requestFn(requestSchema, {\n            // \u2b07\ufe0e feel free to customize the requestInfo object\n            //    with the headers, credentials, cache, etc.\n            headers: {\n              Authorization: `Bearer ${token}`,\n            },\n            ...requestInfo,\n          });\n        },\n        baseUrl: 'https://api.sandbox.monite.com/v1', // the base URL of the API\n      }}\n    >\n      {children}\n    </QraftContext.Provider>\n  );\n}\n"})})]}),(0,r.jsxs)(s.A,{value:"multiple-api-client",label:"Multiple APIs",children:[(0,r.jsxs)(t.p,{children:["In this example, we are using multiple custom ",(0,r.jsx)(t.em,{children:"Qraft Contexts"})," to create multiple API\nclients with different ",(0,r.jsx)(t.code,{children:"baseUrl"})," and ",(0,r.jsx)(t.code,{children:"QueryClient"})," instances."]}),(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",metastring:'title="src/QraftProviders.ts"',children:"import { QraftContextValue, requestFn } from '@openapi-qraft/react';\nimport { createAPIClient } from './api';\n\nimport React, { createContext, useMemo, useEffect, useContext } from \"react\";\nimport { QueryClient } from '@tanstack/react-query'\n\n// \u2b07\ufe0e Create a custom Contexts with the `QraftContextValue` type\nexport const PetStoreQraftContext = createContext<QraftContextValue>(undefined);\nexport const MoniteQraftContext = createContext<QraftContextValue>(undefined);\n\nexport function createPetStoreAPIClient() {\n  // \u2b07\ufe0e Create a Qraft API client with the custom Context\n  return createAPIClient({ context: PetStoreQraftContext });\n}\n\nexport function createMoniteAPIClient() {\n  return createAPIClient({ context: MoniteQraftContext });\n}\n\nexport function QraftProviders({ children }: { children: React.ReactNode }) {\n  const petStoreQueryClient = useMemo(() => new QueryClient(), []);\n  const moniteQueryClient = useMemo(() => new QueryClient(), []);\n\n  useEffect(() => {\n    // \u2b07\ufe0e Mount and unmount the `QueryClient` instances,\n    //   so you will NOT be needed to use `<QueryClientProvider/>` from TanStack\n    petStoreQueryClient.mount();\n    moniteQueryClient.mount();\n    return () => {\n      petStoreQueryClient.unmount();\n      moniteQueryClient.unmount();\n    };\n  }, [petStoreQueryClient, moniteQueryClient]);\n\n  return (\n    <PetStoreQraftContext.Provider\n      value={{\n        // \u2b07\ufe0e specify the `queryClient` to be used by the Hooks\n        //   created with the `createPetStoreAPIClient()`\n        queryClient: petStoreQueryClient,\n        requestFn,\n        baseUrl: 'https://petstore3.swagger.io/api/v3',\n      }}\n    >\n        <MoniteQraftContext.Provider\n          value={{\n            // \u2b07\ufe0e specify the `queryClient` to be used by the Hook\n            //   created with the `createMoniteAPIClient()`\n            queryClient,\n            requestFn,\n            baseUrl: 'https://api.sandbox.monite.com/v1',\n          }}\n        >\n          {children}\n        </MoniteQraftContext.Provider>\n    </PetStoreQraftContext.Provider>\n  );\n}\n"})})]})]})]})}function f(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},2491:(e,t,n)=>{n.d(t,{A:()=>s});n(3696);var r=n(1750);const a={tabItem:"tabItem_wHwb"};var o=n(2540);function s(e){let{children:t,hidden:n,className:s}=e;return(0,o.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,s),hidden:n,children:t})}},8296:(e,t,n)=>{n.d(t,{A:()=>g});var r=n(3696),a=n(1750),o=n(766),s=n(9519),i=n(4395),l=n(5043),u=n(4544),c=n(8708);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??function(e){return d(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:a}}=e;return{value:t,label:n,attributes:r,default:a}}))}(n);return function(e){const t=(0,u.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function f(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function p(e){let{queryString:t=!1,groupId:n}=e;const a=(0,s.W6)(),o=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,l.aZ)(o),(0,r.useCallback)((e=>{if(!o)return;const t=new URLSearchParams(a.location.search);t.set(o,e),a.replace({...a.location,search:t.toString()})}),[o,a])]}function m(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,o=h(e),[s,l]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!f({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:o}))),[u,d]=p({queryString:n,groupId:a}),[m,x]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,o]=(0,c.Dv)(n);return[a,(0,r.useCallback)((e=>{n&&o.set(e)}),[n,o])]}({groupId:a}),b=(()=>{const e=u??m;return f({value:e,tabValues:o})?e:null})();(0,i.A)((()=>{b&&l(b)}),[b]);return{selectedValue:s,selectValue:(0,r.useCallback)((e=>{if(!f({value:e,tabValues:o}))throw new Error(`Can't select invalid tab value=${e}`);l(e),d(e),x(e)}),[d,x,o]),tabValues:o}}var x=n(6681);const b={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var v=n(2540);function C(e){let{className:t,block:n,selectedValue:r,selectValue:s,tabValues:i}=e;const l=[],{blockElementScrollPositionUntilNextRender:u}=(0,o.a_)(),c=e=>{const t=e.currentTarget,n=l.indexOf(t),a=i[n].value;a!==r&&(u(t),s(a))},d=e=>{let t=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":{const n=l.indexOf(e.currentTarget)+1;t=l[n]??l[0];break}case"ArrowLeft":{const n=l.indexOf(e.currentTarget)-1;t=l[n]??l[l.length-1];break}}t?.focus()};return(0,v.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":n},t),children:i.map((e=>{let{value:t,label:n,attributes:o}=e;return(0,v.jsx)("li",{role:"tab",tabIndex:r===t?0:-1,"aria-selected":r===t,ref:e=>l.push(e),onKeyDown:d,onClick:c,...o,className:(0,a.A)("tabs__item",b.tabItem,o?.className,{"tabs__item--active":r===t}),children:n??t},t)}))})}function y(e){let{lazy:t,children:n,selectedValue:a}=e;const o=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=o.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return(0,v.jsx)("div",{className:"margin-top--md",children:o.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==a})))})}function q(e){const t=m(e);return(0,v.jsxs)("div",{className:(0,a.A)("tabs-container",b.tabList),children:[(0,v.jsx)(C,{...e,...t}),(0,v.jsx)(y,{...e,...t})]})}function g(e){const t=(0,x.A)();return(0,v.jsx)(q,{...e,children:d(e.children)},String(t))}},3023:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>i});var r=n(3696);const a={},o=r.createContext(a);function s(e){const t=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),r.createElement(o.Provider,{value:t},e.children)}}}]);