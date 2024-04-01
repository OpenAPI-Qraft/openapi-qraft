"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[327],{5315:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>m,frontMatter:()=>o,metadata:()=>u,toc:()=>d});var r=n(2540),a=n(3023),i=n(8296),s=n(2491);const o={sidebar_position:4,sidebar_label:"useMutation"},l="useMutation(...)",u={id:"hooks/useMutation",title:"useMutation(...)",description:"The Hook enables you to perform asynchronous data mutation operations, such as POST, PUT, PATCH, or DELETE requests.",source:"@site/docs/hooks/useMutation.mdx",sourceDirName:"hooks",slug:"/hooks/useMutation",permalink:"/openapi-qraft/docs/hooks/useMutation",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/hooks/useMutation.mdx",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4,sidebar_label:"useMutation"},sidebar:"mainDocsSidebar",previous:{title:"useQuery",permalink:"/openapi-qraft/docs/hooks/useQuery"},next:{title:"useInfiniteQuery",permalink:"/openapi-qraft/docs/hooks/useInfiniteQuery"}},c={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Examples",id:"examples",level:3}];function h(e){const t={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h1,{id:"usemutation",children:"useMutation(...)"}),"\n",(0,r.jsxs)(t.p,{children:["The Hook enables you to perform asynchronous data mutation operations, such as ",(0,r.jsx)(t.em,{children:"POST"}),", ",(0,r.jsx)(t.em,{children:"PUT"}),", ",(0,r.jsx)(t.em,{children:"PATCH"}),", or ",(0,r.jsx)(t.em,{children:"DELETE"})," requests.\nIt not only handles the loading state, but also provides an APIs for optimistic updates and error handling.\nSee the TanStack ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useMutation",children:(0,r.jsx)(t.em,{children:"useMutation(...) \ud83c\udf34"})}),"\ndocumentation for more details."]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-ts",children:"const query = qraft.<service>.<operation>.useMutation(\n  parameters,\n  mutationOptions,\n  queryClient,\n)\n"})}),"\n",(0,r.jsx)(t.h3,{id:"arguments",children:"Arguments"}),"\n",(0,r.jsxs)(t.ol,{children:["\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsx)(t.p,{children:(0,r.jsx)(t.code,{children:"parameters?: { path, query, header }"})}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Optional"}),", OpenAPI request parameters for the query, strictly-typed \u2728"]}),"\n",(0,r.jsxs)(t.li,{children:["When ",(0,r.jsx)(t.code,{children:"parameters"})," provided, it will be used to generate the ",(0,r.jsx)(t.code,{children:"mutationKey"})]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsx)(t.p,{children:(0,r.jsx)(t.code,{children:"mutationOptions?: UseMutationOptions"})}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Optional"}),", represents the options of the ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useMutation",children:(0,r.jsx)(t.em,{children:"useMutation(...) \ud83c\udf34"})})," Hook"]}),"\n",(0,r.jsxs)(t.li,{children:["When ",(0,r.jsx)(t.code,{children:"qraft.<srv>.<op>.useMutation(parameters)"})," is used (with the predefined ",(0,r.jsx)(t.em,{children:"parameters"}),"), ",(0,r.jsx)(t.code,{children:"mutationKey"})," will contain the ",(0,r.jsx)(t.code,{children:"parameters"})," and ",(0,r.jsx)(t.em,{children:"operation schema"})]}),"\n",(0,r.jsxs)(t.li,{children:["When ",(0,r.jsx)(t.code,{children:"qraft.<srv>.<op>.useMutation(undefined)"})," is used (without predefined ",(0,r.jsx)(t.em,{children:"parameters"}),"), ",(0,r.jsx)(t.code,{children:"mutationKey"})," will contain just ",(0,r.jsx)(t.em,{children:"operation schema"})]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"mutationOptions.mutationFn"})," could be provided to override the default ",(0,r.jsx)(t.code,{children:"mutationFn"})," used by Qraft, strictly-typed \u2728"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"mutationOptions.mutationKey"})," could be provided to override the generated key from ",(0,r.jsx)(t.code,{children:"parameters"}),", strictly-typed \u2728"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsx)(t.p,{children:(0,r.jsx)(t.code,{children:"queryClient?: QueryClient"})}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Optional"})," ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,r.jsx)(t.em,{children:"QueryClient \ud83c\udf34"})})," to be used"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.em,{children:"If not provided"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"QraftContext.queryClient"})," will be used if available"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useQueryClient",children:(0,r.jsx)(t.em,{children:"useQueryClient() \ud83c\udf34"})}),"\nresult will be used as a fallback"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(t.h3,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"mutation: MutationResult"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Object"})," from the ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useMutation",children:(0,r.jsx)(t.em,{children:"useMutation(...) \ud83c\udf34"})})," Hook"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"mutation.mutate(parameters | {parameters, body})"})," initiates the request"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"mutation.variables"})," will contain the ",(0,r.jsx)(t.code,{children:"parameters"})," and ",(0,r.jsx)(t.code,{children:"body"})," of the request,\nafter calling ",(0,r.jsx)(t.code,{children:"mutation.mutate(...)"}),"."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(t.h3,{id:"examples",children:"Examples"}),"\n",(0,r.jsxs)(i.A,{children:[(0,r.jsxs)(s.A,{value:"with-known-parameters",label:"With parameters \ud83d\udcd6",default:!0,children:[(0,r.jsxs)(t.p,{children:["When the ",(0,r.jsx)(t.code,{children:"parameters"})," are known, the ",(0,r.jsx)(t.code,{children:"useMutation"})," hook can be used with parameters\nto generate the ",(0,r.jsx)(t.code,{children:"mutationKey"}),"."]}),(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"mutation.mutate(...)"})," will accept the ",(0,r.jsx)(t.code,{children:"body"})," of the request\nas the single argument."]}),"\n"]}),(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",metastring:'title="src/EntityEditForm.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nconst qraft = createAPIClient();\n\nfunction EntityEditForm({ entityId }: { entityId: string }) {\n  const mutation = qraft.entities.entitiesIdDocuments.useMutation({\n    path: {\n      entity_id: entityId\n    },\n    header: {\n      'x-monite-version': '2023-09-01',\n    },\n  });\n\n  return (\n    <form\n      onSubmit={(event) => {\n        event.preventDefault();\n        const formData = new FormData(event.currentTarget);\n        /**\n         * `mutation.mutate(...)` triggers the submission of a request:\n         * ###\n         * POST /entities/3e3e-3e3e-3e3e/documents\n         * x-monite-version: 2023-09-01\n         *\n         * {\"company_tax_id_verification\": [\"verification-id\"]}\n         **/\n        mutation.mutate({\n          company_tax_id_verification: [\n            `${formData.get('company_tax_id_verification')}`,\n          ],\n        });\n      }}\n    >\n      <input name=\"company_tax_id_verification\" />\n      <button disabled={mutation.isPending}>Submit</button>\n    </form>\n  );\n}\n"})})]}),(0,r.jsxs)(s.A,{value:"without-known-parameters",label:"No parameters \ud83d\udcd3",children:[(0,r.jsxs)(t.p,{children:["When the ",(0,r.jsx)(t.code,{children:"parameters"})," are not known, the ",(0,r.jsx)(t.code,{children:"useMutation"})," hook can be used without parameters."]}),(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"mutation.mutate(...)"})," will accept the object with ",(0,r.jsx)(t.code,{children:"parameters"})," and ",(0,r.jsx)(t.code,{children:"body"})," of the request as the single argument."]}),"\n"]}),(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",metastring:'title="src/EntityForm.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nconst qraft = createAPIClient();\n\nfunction EntityForm() {\n  const mutation = qraft.entities.entitiesIdDocuments.useMutation();\n\n  return (\n    <form\n      onSubmit={(event) => {\n        event.preventDefault();\n        const formData = new FormData(event.currentTarget);\n        /**\n         * `mutation.mutate(...)` triggers the submission of a request:\n         * ###\n         * POST /entities/3e3e-3e3e-3e3e/documents\n         * x-monite-version: 2023-09-01\n         *\n         * {\"company_tax_id_verification\": [\"verification-id\"]}\n         **/\n        mutation.mutate({\n          parameters: {\n            path: {\n              entity_id: `${formData.get('entity_id')}`\n            },\n            header: {\n              'x-monite-version': '2023-09-01',\n            },\n          },\n          body: {\n            company_tax_id_verification: [\n              `${formData.get('company_tax_id_verification')}`,\n            ],\n          }\n        });\n      }}\n    >\n      <input name=\"entity_id\" readOnly={mutation.isPending} />\n      <input name=\"company_tax_id_verification\" readOnly={mutation.isPending} />\n      <button disabled={mutation.isPending}>Submit</button>\n    </form>\n  );\n}\n"})})]})]})]})}function m(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},2491:(e,t,n)=>{n.d(t,{A:()=>s});n(3696);var r=n(1750);const a={tabItem:"tabItem_wHwb"};var i=n(2540);function s(e){let{children:t,hidden:n,className:s}=e;return(0,i.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,s),hidden:n,children:t})}},8296:(e,t,n)=>{n.d(t,{A:()=>w});var r=n(3696),a=n(1750),i=n(766),s=n(9519),o=n(4395),l=n(5043),u=n(4544),c=n(8708);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??function(e){return d(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:a}}=e;return{value:t,label:n,attributes:r,default:a}}))}(n);return function(e){const t=(0,u.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function m(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function p(e){let{queryString:t=!1,groupId:n}=e;const a=(0,s.W6)(),i=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,l.aZ)(i),(0,r.useCallback)((e=>{if(!i)return;const t=new URLSearchParams(a.location.search);t.set(i,e),a.replace({...a.location,search:t.toString()})}),[i,a])]}function f(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,i=h(e),[s,l]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!m({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:i}))),[u,d]=p({queryString:n,groupId:a}),[f,x]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,i]=(0,c.Dv)(n);return[a,(0,r.useCallback)((e=>{n&&i.set(e)}),[n,i])]}({groupId:a}),j=(()=>{const e=u??f;return m({value:e,tabValues:i})?e:null})();(0,o.A)((()=>{j&&l(j)}),[j]);return{selectedValue:s,selectValue:(0,r.useCallback)((e=>{if(!m({value:e,tabValues:i}))throw new Error(`Can't select invalid tab value=${e}`);l(e),d(e),x(e)}),[d,x,i]),tabValues:i}}var x=n(6681);const j={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var b=n(2540);function y(e){let{className:t,block:n,selectedValue:r,selectValue:s,tabValues:o}=e;const l=[],{blockElementScrollPositionUntilNextRender:u}=(0,i.a_)(),c=e=>{const t=e.currentTarget,n=l.indexOf(t),a=o[n].value;a!==r&&(u(t),s(a))},d=e=>{let t=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":{const n=l.indexOf(e.currentTarget)+1;t=l[n]??l[0];break}case"ArrowLeft":{const n=l.indexOf(e.currentTarget)-1;t=l[n]??l[l.length-1];break}}t?.focus()};return(0,b.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":n},t),children:o.map((e=>{let{value:t,label:n,attributes:i}=e;return(0,b.jsx)("li",{role:"tab",tabIndex:r===t?0:-1,"aria-selected":r===t,ref:e=>l.push(e),onKeyDown:d,onClick:c,...i,className:(0,a.A)("tabs__item",j.tabItem,i?.className,{"tabs__item--active":r===t}),children:n??t},t)}))})}function v(e){let{lazy:t,children:n,selectedValue:a}=e;const i=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=i.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return(0,b.jsx)("div",{className:"margin-top--md",children:i.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==a})))})}function g(e){const t=f(e);return(0,b.jsxs)("div",{className:(0,a.A)("tabs-container",j.tabList),children:[(0,b.jsx)(y,{...e,...t}),(0,b.jsx)(v,{...e,...t})]})}function w(e){const t=(0,x.A)();return(0,b.jsx)(g,{...e,children:d(e.children)},String(t))}},3023:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>o});var r=n(3696);const a={},i=r.createContext(a);function s(e){const t=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),r.createElement(i.Provider,{value:t},e.children)}}}]);