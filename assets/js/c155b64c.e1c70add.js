"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[5122],{9393:(e,n,t)=>{t.d(n,{A:()=>a});t(3696);var r=t(1750);const i={tabItem:"tabItem_wHwb"};var s=t(2540);function a(e){let{children:n,hidden:t,className:a}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,r.A)(i.tabItem,a),hidden:t,children:n})}},9942:(e,n,t)=>{t.d(n,{A:()=>I});var r=t(3696),i=t(1750),s=t(5162),a=t(9519),l=t(5367),o=t(271),c=t(5476),u=t(5095);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:i}}=e;return{value:n,label:t,attributes:r,default:i}}))}(t);return function(e){const n=(0,c.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function h(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function f(e){let{queryString:n=!1,groupId:t}=e;const i=(0,a.W6)(),s=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,o.aZ)(s),(0,r.useCallback)((e=>{if(!s)return;const n=new URLSearchParams(i.location.search);n.set(s,e),i.replace({...i.location,search:n.toString()})}),[s,i])]}function m(e){const{defaultValue:n,queryString:t=!1,groupId:i}=e,s=p(e),[a,o]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!h({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:s}))),[c,d]=f({queryString:t,groupId:i}),[m,x]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[i,s]=(0,u.Dv)(t);return[i,(0,r.useCallback)((e=>{t&&s.set(e)}),[t,s])]}({groupId:i}),b=(()=>{const e=c??m;return h({value:e,tabValues:s})?e:null})();(0,l.A)((()=>{b&&o(b)}),[b]);return{selectedValue:a,selectValue:(0,r.useCallback)((e=>{if(!h({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);o(e),d(e),x(e)}),[d,x,s]),tabValues:s}}var x=t(1173);const b={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var y=t(2540);function C(e){let{className:n,block:t,selectedValue:r,selectValue:a,tabValues:l}=e;const o=[],{blockElementScrollPositionUntilNextRender:c}=(0,s.a_)(),u=e=>{const n=e.currentTarget,t=o.indexOf(n),i=l[t].value;i!==r&&(c(n),a(i))},d=e=>{let n=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const t=o.indexOf(e.currentTarget)+1;n=o[t]??o[0];break}case"ArrowLeft":{const t=o.indexOf(e.currentTarget)-1;n=o[t]??o[o.length-1];break}}n?.focus()};return(0,y.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.A)("tabs",{"tabs--block":t},n),children:l.map((e=>{let{value:n,label:t,attributes:s}=e;return(0,y.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>o.push(e),onKeyDown:d,onClick:u,...s,className:(0,i.A)("tabs__item",b.tabItem,s?.className,{"tabs__item--active":r===n}),children:t??n},n)}))})}function g(e){let{lazy:n,children:t,selectedValue:s}=e;const a=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=a.find((e=>e.props.value===s));return e?(0,r.cloneElement)(e,{className:(0,i.A)("margin-top--md",e.props.className)}):null}return(0,y.jsx)("div",{className:"margin-top--md",children:a.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==s})))})}function j(e){const n=m(e);return(0,y.jsxs)("div",{className:(0,i.A)("tabs-container",b.tabList),children:[(0,y.jsx)(C,{...n,...e}),(0,y.jsx)(g,{...n,...e})]})}function I(e){const n=(0,x.A)();return(0,y.jsx)(j,{...e,children:d(e.children)},String(n))}},403:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>u,contentTitle:()=>o,default:()=>h,frontMatter:()=>l,metadata:()=>c,toc:()=>d});var r=t(2540),i=t(3023),s=t(9942),a=t(9393);const l={sidebar_position:2,sidebar_label:"createAPIClient()"},o="createAPIClient(...)",c={id:"codegen/create-api-client-function",title:"createAPIClient(...)",description:"Qraft CLI generates a helper function createAPIClient(...), which creates a Qraft API client with",source:"@site/docs/codegen/create-api-client-function.mdx",sourceDirName:"codegen",slug:"/codegen/create-api-client-function",permalink:"/openapi-qraft/docs/next/codegen/create-api-client-function",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/codegen/create-api-client-function.mdx",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2,sidebar_label:"createAPIClient()"},sidebar:"mainDocsSidebar",previous:{title:"CLI",permalink:"/openapi-qraft/docs/next/codegen/cli"},next:{title:"GET, HEAD, OPTIONS",permalink:"/openapi-qraft/docs/next/core/query-operation"}},u={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Arguments",id:"arguments-1",level:3},{value:"Returns",id:"returns-1",level:3},{value:"Examples",id:"examples",level:3}];function p(e){const n={code:"code",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"createapiclient",children:"createAPIClient(...)"})}),"\n",(0,r.jsxs)(n.p,{children:["Qraft CLI generates a helper function ",(0,r.jsx)(n.code,{children:"createAPIClient(...)"}),", which creates a Qraft API client with\nthe necessary ",(0,r.jsx)(n.code,{children:"requestFn"}),", ",(0,r.jsx)(n.code,{children:"baseUrl"})," and ",(0,r.jsx)(n.code,{children:"queryClient"})," for React Hooks."]}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsxs)(a.A,{value:"with-query-client",label:(0,r.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["With ",(0,r.jsx)(n.code,{children:"QueryClient"})]}),default:!0,children:[(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"import { createAPIClient } from './api'\n\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl,\n})\n"})}),(0,r.jsx)(n.h3,{id:"arguments",children:"Arguments"}),(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"options: QraftClientOptions"})," - ",(0,r.jsx)(n.strong,{children:"Required"})," options to be used by the Qraft API client","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"options.queryClient"})," - ",(0,r.jsx)(n.strong,{children:"Required"})," ",(0,r.jsx)(n.code,{children:"QueryClient"})," instance to be used by Qraft Hooks."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"options.requestFn"})," - ",(0,r.jsx)(n.strong,{children:"Required"})," ",(0,r.jsx)(n.code,{children:"requestFn"})," function to be used by Qraft Hooks."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"options.baseUrl"})," - ",(0,r.jsx)(n.strong,{children:"Required"})," base URL for the ",(0,r.jsx)(n.code,{children:"requestFn"})," function."]}),"\n"]}),"\n"]}),"\n"]}),(0,r.jsx)(n.h3,{id:"returns",children:"Returns"}),(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"Qraft API client with the necessary React Hooks for operations.\nIt contains all the methods to interact with the API grouped in services."}),"\n"]})]}),(0,r.jsxs)(a.A,{value:"without-query-client",label:(0,r.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["Without ",(0,r.jsx)(n.code,{children:"QueryClient"})]}),children:[(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"import { createAPIClient } from './api'\n\nconst api = createAPIClient({\n  requestFn,\n  baseUrl,\n})\n"})}),(0,r.jsx)(n.h3,{id:"arguments-1",children:"Arguments"}),(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"options: QraftClientOptions"})," - ",(0,r.jsx)(n.strong,{children:"Required"})," options to be used by the Qraft API client","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"options.requestFn"})," - ",(0,r.jsx)(n.strong,{children:"Required"})," ",(0,r.jsx)(n.code,{children:"requestFn"})," function to be used by Qraft requests."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"options.baseUrl"})," - ",(0,r.jsx)(n.strong,{children:"Required"})," base URL for the ",(0,r.jsx)(n.code,{children:"requestFn"})," function."]}),"\n"]}),"\n"]}),"\n"]}),(0,r.jsx)(n.h3,{id:"returns-1",children:"Returns"}),(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"Qraft API client with the necessary operations.\nIt contains all the methods to interact with the API grouped in services."}),"\n"]})]})]}),"\n",(0,r.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsx)(a.A,{value:"basic",label:"Basic",default:!0,children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",metastring:'title="src/fetch-queries.ts"',children:"import { requestFn } from '@openapi-qraft/react';\nimport { createAPIClient } from './api'; // generated by OpenAPI Qraft CLI\n\nimport { QueryClient, dehydrate } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\n// \u2b07\ufe0e Create a Qraft API client\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://api.sandbox.monite.com/v1',\n});\n\n// \u2b07\ufe0e Fetch the `getPetById` query with the `queryClient`\nconst pet = await qraft.pet.getPetById.fetchQuery(\n  { parameters: { path: { petId: 1 } } }\n);\n\nconsole.log(pet.name); // `pet` is the result of the `getPetById` request\n\ndehydrate(queryClient); // Dehydrate the `queryClient` to be used for SSR\n"})})}),(0,r.jsxs)(a.A,{value:"multiple-api-versions",label:(0,r.jsx)(n.span,{style:{verticalAlign:"middle"},children:"Multiple API versions"}),children:[(0,r.jsxs)(n.p,{children:["In this example, we create a multiple API clients that manages two different API clients, each with its own ",(0,r.jsx)(n.code,{children:"QueryClient"}),".\nThis  mounts and unmounts ",(0,r.jsx)(n.code,{children:"QueryClient"})," during the lifecycle of the application."]}),(0,r.jsx)(n.p,{children:"This setup is particularly useful when you need to work with different API versions simultaneously, or when you're in the process\nof migrating from one API version to another."}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",metastring:'title="src/MultipleAPIClientsApp.tsx"',children:"import { createAPIClient as createAPIClientV1 } from './api-v1'; // generated by OpenAPI Qraft CLI\nimport { createAPIClient as createAPIClientV2 } from './api-v2'; // generated by OpenAPI Qraft CLI\nimport { requestFn } from '@openapi-qraft/react';\nimport { createContext, useContext, useMemo, useEffect, type ReactNode} from \"react\";\nimport { QueryClient } from '@tanstack/react-query'\n\n// Create a context for multiple API clients\nconst MultipleAPIClientsContext = createContext<{\n  apiV1: ReturnType<typeof createAPIClientV1>;\n  apiV2: ReturnType<typeof createAPIClientV2>;\n}>(null!);\n\nexport default function MultipleAPIClientsApp({ children }: { children: ReactNode }) {\n  const queryClient1 = useMemo(() => new QueryClient(), []);\n  const queryClient2 = useMemo(() => new QueryClient(), []);\n\n  const apiV1 = useMemo(() => createAPIClientV1({\n    requestFn,\n    queryClient: queryClient1,\n    baseUrl: 'https://api.sandbox.monite.com/v1',\n  }), [queryClient1]);\n\n  const apiV2 = useMemo(() => createAPIClientV2({\n    requestFn,\n    queryClient: queryClient2,\n    baseUrl: 'https://api.sandbox.monite.com/v2',\n  }), [queryClient2]);\n\n  useEffect(() => {\n    queryClient1.mount();\n    queryClient2.mount();\n    return () => {\n      queryClient1.unmount();\n      queryClient2.unmount();\n    };\n  }, [queryClient1, queryClient2]);\n\n  return (\n    <MultipleAPIClientsContext.Provider value={{ apiV1, apiV2 }}>\n      {children}\n    </MultipleAPIClientsContext.Provider>\n  );\n}\n\nfunction YourComponents() {\n  const { apiV1, apiV2 } = useContext(MultipleAPIClientsContext);\n\n  // Use `apiV1` and `apiV2` as needed\n  // ...\n}\n"})})]})]})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(p,{...e})}):p(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>a,x:()=>l});var r=t(3696);const i={},s=r.createContext(i);function a(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);