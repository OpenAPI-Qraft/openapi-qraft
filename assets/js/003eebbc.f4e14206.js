"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[3327],{1208:(e,n,t)=>{t.d(n,{A:()=>s});t(3696);var r=t(2689);const a={tabItem:"tabItem_wHwb"};var i=t(2540);function s(e){let{children:n,hidden:t,className:s}=e;return(0,i.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,s),hidden:t,children:n})}},9515:(e,n,t)=>{t.d(n,{A:()=>w});var r=t(3696),a=t(2689),i=t(3447),s=t(9519),o=t(6960),u=t(9624),l=t(6953),c=t(9866);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:a}}=e;return{value:n,label:t,attributes:r,default:a}}))}(t);return function(e){const n=(0,l.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function m(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function p(e){let{queryString:n=!1,groupId:t}=e;const a=(0,s.W6)(),i=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,u.aZ)(i),(0,r.useCallback)((e=>{if(!i)return;const n=new URLSearchParams(a.location.search);n.set(i,e),a.replace({...a.location,search:n.toString()})}),[i,a])]}function f(e){const{defaultValue:n,queryString:t=!1,groupId:a}=e,i=h(e),[s,u]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!m({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:i}))),[l,d]=p({queryString:t,groupId:a}),[f,x]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[a,i]=(0,c.Dv)(t);return[a,(0,r.useCallback)((e=>{t&&i.set(e)}),[t,i])]}({groupId:a}),b=(()=>{const e=l??f;return m({value:e,tabValues:i})?e:null})();(0,o.A)((()=>{b&&u(b)}),[b]);return{selectedValue:s,selectValue:(0,r.useCallback)((e=>{if(!m({value:e,tabValues:i}))throw new Error(`Can't select invalid tab value=${e}`);u(e),d(e),x(e)}),[d,x,i]),tabValues:i}}var x=t(9244);const b={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var j=t(2540);function y(e){let{className:n,block:t,selectedValue:r,selectValue:s,tabValues:o}=e;const u=[],{blockElementScrollPositionUntilNextRender:l}=(0,i.a_)(),c=e=>{const n=e.currentTarget,t=u.indexOf(n),a=o[t].value;a!==r&&(l(n),s(a))},d=e=>{let n=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":{const t=u.indexOf(e.currentTarget)+1;n=u[t]??u[0];break}case"ArrowLeft":{const t=u.indexOf(e.currentTarget)-1;n=u[t]??u[u.length-1];break}}n?.focus()};return(0,j.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":t},n),children:o.map((e=>{let{value:n,label:t,attributes:i}=e;return(0,j.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>u.push(e),onKeyDown:d,onClick:c,...i,className:(0,a.A)("tabs__item",b.tabItem,i?.className,{"tabs__item--active":r===n}),children:t??n},n)}))})}function v(e){let{lazy:n,children:t,selectedValue:i}=e;const s=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=s.find((e=>e.props.value===i));return e?(0,r.cloneElement)(e,{className:(0,a.A)("margin-top--md",e.props.className)}):null}return(0,j.jsx)("div",{className:"margin-top--md",children:s.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==i})))})}function g(e){const n=f(e);return(0,j.jsxs)("div",{className:(0,a.A)("tabs-container",b.tabList),children:[(0,j.jsx)(y,{...n,...e}),(0,j.jsx)(v,{...n,...e})]})}function w(e){const n=(0,x.A)();return(0,j.jsx)(g,{...e,children:d(e.children)},String(n))}},695:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>l,default:()=>m,frontMatter:()=>u,metadata:()=>r,toc:()=>d});const r=JSON.parse('{"id":"hooks/useMutation","title":"useMutation()","description":"The Hook enables you to perform asynchronous data mutation operations, such as POST, PUT, PATCH, or DELETE requests.","source":"@site/docs/hooks/useMutation.mdx","sourceDirName":"hooks","slug":"/hooks/useMutation","permalink":"/openapi-qraft/docs/hooks/useMutation","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/hooks/useMutation.mdx","tags":[],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_position":4,"sidebar_label":"useMutation()"},"sidebar":"mainDocsSidebar","previous":{"title":"useQuery()","permalink":"/openapi-qraft/docs/hooks/useQuery"},"next":{"title":"useInfiniteQuery()","permalink":"/openapi-qraft/docs/hooks/useInfiniteQuery"}}');var a=t(2540),i=t(3023),s=t(9515),o=t(1208);const u={sidebar_position:4,sidebar_label:"useMutation()"},l="useMutation()",c={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Examples",id:"examples",level:3}];function h(e){const n={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"usemutation",children:"useMutation()"})}),"\n",(0,a.jsxs)(n.p,{children:["The Hook enables you to perform asynchronous data mutation operations, such as ",(0,a.jsx)(n.em,{children:"POST"}),", ",(0,a.jsx)(n.em,{children:"PUT"}),", ",(0,a.jsx)(n.em,{children:"PATCH"}),", or ",(0,a.jsx)(n.em,{children:"DELETE"})," requests.\nIt not only handles the loading state, but also provides an APIs for optimistic updates and error handling.\nSee the TanStack ",(0,a.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useMutation",children:(0,a.jsx)(n.em,{children:"useMutation(...) \ud83c\udf34"})}),"\ndocumentation for more details."]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-ts",children:"const query = api.<service>.<operation>.useMutation(\n  parameters,\n  mutationOptions\n)\n"})}),"\n",(0,a.jsx)(n.h3,{id:"arguments",children:"Arguments"}),"\n",(0,a.jsxs)(n.ol,{children:["\n",(0,a.jsxs)(n.li,{children:["\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.code,{children:"parameters?: { path, query, header }"})}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.strong,{children:"Optional"}),", OpenAPI request parameters for the query, strictly-typed \u2728"]}),"\n",(0,a.jsxs)(n.li,{children:["When ",(0,a.jsx)(n.code,{children:"parameters"})," provided, it will be used to generate the ",(0,a.jsx)(n.code,{children:"mutationKey"})]}),"\n"]}),"\n"]}),"\n",(0,a.jsxs)(n.li,{children:["\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.code,{children:"mutationOptions?: UseMutationOptions"})}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.strong,{children:"Optional"}),", represents the options of the ",(0,a.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useMutation",children:(0,a.jsx)(n.em,{children:"useMutation(...) \ud83c\udf34"})})," Hook"]}),"\n",(0,a.jsxs)(n.li,{children:["When ",(0,a.jsx)(n.code,{children:"api.<srv>.<op>.useMutation(parameters)"})," is used (with the predefined ",(0,a.jsx)(n.em,{children:"parameters"}),"), ",(0,a.jsx)(n.code,{children:"mutationKey"})," will contain the ",(0,a.jsx)(n.code,{children:"parameters"})," and ",(0,a.jsx)(n.em,{children:"operation schema"})]}),"\n",(0,a.jsxs)(n.li,{children:["When ",(0,a.jsx)(n.code,{children:"api.<srv>.<op>.useMutation(undefined)"})," is used (without predefined ",(0,a.jsx)(n.em,{children:"parameters"}),"), ",(0,a.jsx)(n.code,{children:"mutationKey"})," will contain just ",(0,a.jsx)(n.em,{children:"operation schema"})]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"mutationOptions.mutationFn"})," could be provided to override the default ",(0,a.jsx)(n.code,{children:"mutationFn"})," used by Qraft, strictly-typed \u2728"]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"mutationOptions.mutationKey"})," could be provided to override the generated key from ",(0,a.jsx)(n.code,{children:"parameters"}),", strictly-typed \u2728"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,a.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"mutation: MutationResult"}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.strong,{children:"Object"})," from the ",(0,a.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useMutation",children:(0,a.jsx)(n.em,{children:"useMutation(...) \ud83c\udf34"})})," Hook"]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"mutation.mutate(parameters | {parameters, body})"})," initiates the request"]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"mutation.variables"})," will contain the ",(0,a.jsx)(n.code,{children:"parameters"})," and ",(0,a.jsx)(n.code,{children:"body"})," of the request,\nafter calling ",(0,a.jsx)(n.code,{children:"mutation.mutate(...)"}),"."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,a.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,a.jsxs)(s.A,{children:[(0,a.jsxs)(o.A,{value:"with-known-parameters",label:"With parameters \ud83d\udcd6",default:!0,children:[(0,a.jsxs)(n.p,{children:["When the ",(0,a.jsx)(n.code,{children:"parameters"})," are known, the ",(0,a.jsx)(n.code,{children:"useMutation"})," hook can be used with parameters\nto generate the ",(0,a.jsx)(n.code,{children:"mutationKey"}),"."]}),(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"mutation.mutate(...)"})," will accept the ",(0,a.jsx)(n.code,{children:"body"})," of the request\nas the single argument."]}),"\n"]}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",metastring:'title="src/EntityEditForm.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nimport { requestFn } from '@openapi-qraft/react';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://api.sandbox.monite.com/v1',\n});\n\nfunction EntityEditForm({ entityId }: { entityId: string }) {\n  const mutation = api.entities.entitiesIdDocuments.useMutation({\n    path: {\n      entity_id: entityId\n    },\n    header: {\n      'x-monite-version': '2023-09-01',\n    },\n  });\n\n  return (\n    <form\n      onSubmit={(event) => {\n        event.preventDefault();\n        const formData = new FormData(event.currentTarget);\n        /**\n         * `mutation.mutate(...)` triggers the submission of a request:\n         * ###\n         * POST /entities/3e3e-3e3e-3e3e/documents\n         * x-monite-version: 2023-09-01\n         *\n         * {\"company_tax_id_verification\": [\"verification-id\"]}\n         **/\n        mutation.mutate({\n          company_tax_id_verification: [\n            `${formData.get('company_tax_id_verification')}`,\n          ],\n        });\n      }}\n    >\n      <input name=\"company_tax_id_verification\" />\n      <button disabled={mutation.isPending}>Submit</button>\n    </form>\n  );\n}\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <EntityEditForm entityId=\"123\" />\n    </QueryClientProvider>\n  );\n}\n"})})]}),(0,a.jsxs)(o.A,{value:"without-known-parameters",label:"No parameters \ud83d\udcd3",children:[(0,a.jsxs)(n.p,{children:["When the ",(0,a.jsx)(n.code,{children:"parameters"})," are not known, the ",(0,a.jsx)(n.code,{children:"useMutation"})," hook can be used without parameters."]}),(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"mutation.mutate(...)"})," will accept the object with ",(0,a.jsx)(n.code,{children:"parameters"})," and ",(0,a.jsx)(n.code,{children:"body"})," of the request as the single argument."]}),"\n"]}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",metastring:'title="src/EntityForm.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nimport { requestFn } from '@openapi-qraft/react';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://api.sandbox.monite.com/v1',\n});\n\nfunction EntityForm() {\n  const mutation = api.entities.entitiesIdDocuments.useMutation();\n\n  return (\n    <form\n      onSubmit={(event) => {\n        event.preventDefault();\n        const formData = new FormData(event.currentTarget);\n        /**\n         * `mutation.mutate(...)` triggers the submission of a request:\n         * ###\n         * POST /entities/3e3e-3e3e-3e3e/documents\n         * x-monite-version: 2023-09-01\n         *\n         * {\"company_tax_id_verification\": [\"verification-id\"]}\n         **/\n        mutation.mutate({\n          parameters: {\n            path: {\n              entity_id: `${formData.get('entity_id')}`\n            },\n            header: {\n              'x-monite-version': '2023-09-01',\n            },\n          },\n          body: {\n            company_tax_id_verification: [\n              `${formData.get('company_tax_id_verification')}`,\n            ],\n          }\n        });\n      }}\n    >\n      <input name=\"entity_id\" readOnly={mutation.isPending} />\n      <input name=\"company_tax_id_verification\" readOnly={mutation.isPending} />\n      <button disabled={mutation.isPending}>Submit</button>\n    </form>\n  );\n}\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <EntityForm />\n    </QueryClientProvider>\n  );\n}\n"})})]})]})]})}function m(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(h,{...e})}):h(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>s,x:()=>o});var r=t(3696);const a={},i=r.createContext(a);function s(e){const n=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);