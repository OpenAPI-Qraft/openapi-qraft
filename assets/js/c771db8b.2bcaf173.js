"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[53],{9393:(e,n,t)=>{t.d(n,{A:()=>i});t(3696);var r=t(1750);const a={tabItem:"tabItem_wHwb"};var s=t(2540);function i(e){let{children:n,hidden:t,className:i}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,i),hidden:t,children:n})}},9942:(e,n,t)=>{t.d(n,{A:()=>w});var r=t(3696),a=t(1750),s=t(5162),i=t(9519),o=t(5367),l=t(271),u=t(5476),c=t(5095);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:a}}=e;return{value:n,label:t,attributes:r,default:a}}))}(t);return function(e){const n=(0,u.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function m(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function p(e){let{queryString:n=!1,groupId:t}=e;const a=(0,i.W6)(),s=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,l.aZ)(s),(0,r.useCallback)((e=>{if(!s)return;const n=new URLSearchParams(a.location.search);n.set(s,e),a.replace({...a.location,search:n.toString()})}),[s,a])]}function f(e){const{defaultValue:n,queryString:t=!1,groupId:a}=e,s=h(e),[i,l]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!m({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:s}))),[u,d]=p({queryString:t,groupId:a}),[f,x]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[a,s]=(0,c.Dv)(t);return[a,(0,r.useCallback)((e=>{t&&s.set(e)}),[t,s])]}({groupId:a}),j=(()=>{const e=u??f;return m({value:e,tabValues:s})?e:null})();(0,o.A)((()=>{j&&l(j)}),[j]);return{selectedValue:i,selectValue:(0,r.useCallback)((e=>{if(!m({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);l(e),d(e),x(e)}),[d,x,s]),tabValues:s}}var x=t(1173);const j={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var b=t(2540);function v(e){let{className:n,block:t,selectedValue:r,selectValue:i,tabValues:o}=e;const l=[],{blockElementScrollPositionUntilNextRender:u}=(0,s.a_)(),c=e=>{const n=e.currentTarget,t=l.indexOf(n),a=o[t].value;a!==r&&(u(n),i(a))},d=e=>{let n=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":{const t=l.indexOf(e.currentTarget)+1;n=l[t]??l[0];break}case"ArrowLeft":{const t=l.indexOf(e.currentTarget)-1;n=l[t]??l[l.length-1];break}}n?.focus()};return(0,b.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":t},n),children:o.map((e=>{let{value:n,label:t,attributes:s}=e;return(0,b.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>l.push(e),onKeyDown:d,onClick:c,...s,className:(0,a.A)("tabs__item",j.tabItem,s?.className,{"tabs__item--active":r===n}),children:t??n},n)}))})}function y(e){let{lazy:n,children:t,selectedValue:s}=e;const i=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=i.find((e=>e.props.value===s));return e?(0,r.cloneElement)(e,{className:(0,a.A)("margin-top--md",e.props.className)}):null}return(0,b.jsx)("div",{className:"margin-top--md",children:i.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==s})))})}function g(e){const n=f(e);return(0,b.jsxs)("div",{className:(0,a.A)("tabs-container",j.tabList),children:[(0,b.jsx)(v,{...n,...e}),(0,b.jsx)(y,{...n,...e})]})}function w(e){const n=(0,x.A)();return(0,b.jsx)(g,{...e,children:d(e.children)},String(n))}},4001:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>l,default:()=>m,frontMatter:()=>o,metadata:()=>u,toc:()=>d});var r=t(2540),a=t(3023),s=t(9942),i=t(9393);const o={sidebar_position:4,sidebar_label:"useMutation()"},l="useMutation()",u={id:"hooks/useMutation",title:"useMutation()",description:"The Hook enables you to perform asynchronous data mutation operations, such as POST, PUT, PATCH, or DELETE requests.",source:"@site/versioned_docs/version-1.x/hooks/useMutation.mdx",sourceDirName:"hooks",slug:"/hooks/useMutation",permalink:"/openapi-qraft/docs/hooks/useMutation",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/versioned_docs/version-1.x/hooks/useMutation.mdx",tags:[],version:"1.x",sidebarPosition:4,frontMatter:{sidebar_position:4,sidebar_label:"useMutation()"},sidebar:"mainDocsSidebar",previous:{title:"useQuery()",permalink:"/openapi-qraft/docs/hooks/useQuery"},next:{title:"useInfiniteQuery()",permalink:"/openapi-qraft/docs/hooks/useInfiniteQuery"}},c={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Examples",id:"examples",level:3}];function h(e){const n={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"usemutation",children:"useMutation()"})}),"\n",(0,r.jsxs)(n.p,{children:["The Hook enables you to perform asynchronous data mutation operations, such as ",(0,r.jsx)(n.em,{children:"POST"}),", ",(0,r.jsx)(n.em,{children:"PUT"}),", ",(0,r.jsx)(n.em,{children:"PATCH"}),", or ",(0,r.jsx)(n.em,{children:"DELETE"})," requests.\nIt not only handles the loading state, but also provides an APIs for optimistic updates and error handling.\nSee the TanStack ",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useMutation",children:(0,r.jsx)(n.em,{children:"useMutation(...) \ud83c\udf34"})}),"\ndocumentation for more details."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"const query = qraft.<service>.<operation>.useMutation(\n  parameters,\n  mutationOptions,\n  queryClient,\n)\n"})}),"\n",(0,r.jsx)(n.h3,{id:"arguments",children:"Arguments"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"parameters?: { path, query, header }"})}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Optional"}),", OpenAPI request parameters for the query, strictly-typed \u2728"]}),"\n",(0,r.jsxs)(n.li,{children:["When ",(0,r.jsx)(n.code,{children:"parameters"})," provided, it will be used to generate the ",(0,r.jsx)(n.code,{children:"mutationKey"})]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"mutationOptions?: UseMutationOptions"})}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Optional"}),", represents the options of the ",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useMutation",children:(0,r.jsx)(n.em,{children:"useMutation(...) \ud83c\udf34"})})," Hook"]}),"\n",(0,r.jsxs)(n.li,{children:["When ",(0,r.jsx)(n.code,{children:"qraft.<srv>.<op>.useMutation(parameters)"})," is used (with the predefined ",(0,r.jsx)(n.em,{children:"parameters"}),"), ",(0,r.jsx)(n.code,{children:"mutationKey"})," will contain the ",(0,r.jsx)(n.code,{children:"parameters"})," and ",(0,r.jsx)(n.em,{children:"operation schema"})]}),"\n",(0,r.jsxs)(n.li,{children:["When ",(0,r.jsx)(n.code,{children:"qraft.<srv>.<op>.useMutation(undefined)"})," is used (without predefined ",(0,r.jsx)(n.em,{children:"parameters"}),"), ",(0,r.jsx)(n.code,{children:"mutationKey"})," will contain just ",(0,r.jsx)(n.em,{children:"operation schema"})]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"mutationOptions.mutationFn"})," could be provided to override the default ",(0,r.jsx)(n.code,{children:"mutationFn"})," used by Qraft, strictly-typed \u2728"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"mutationOptions.mutationKey"})," could be provided to override the generated key from ",(0,r.jsx)(n.code,{children:"parameters"}),", strictly-typed \u2728"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"queryClient?: QueryClient"})}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Optional"})," ",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,r.jsx)(n.em,{children:"QueryClient \ud83c\udf34"})})," to be used"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.em,{children:"If not provided"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"QraftContext.queryClient"})," will be used if available"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useQueryClient",children:(0,r.jsx)(n.em,{children:"useQueryClient() \ud83c\udf34"})}),"\nresult will be used as a fallback"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"mutation: MutationResult"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Object"})," from the ",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useMutation",children:(0,r.jsx)(n.em,{children:"useMutation(...) \ud83c\udf34"})})," Hook"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"mutation.mutate(parameters | {parameters, body})"})," initiates the request"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"mutation.variables"})," will contain the ",(0,r.jsx)(n.code,{children:"parameters"})," and ",(0,r.jsx)(n.code,{children:"body"})," of the request,\nafter calling ",(0,r.jsx)(n.code,{children:"mutation.mutate(...)"}),"."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsxs)(i.A,{value:"with-known-parameters",label:"With parameters \ud83d\udcd6",default:!0,children:[(0,r.jsxs)(n.p,{children:["When the ",(0,r.jsx)(n.code,{children:"parameters"})," are known, the ",(0,r.jsx)(n.code,{children:"useMutation"})," hook can be used with parameters\nto generate the ",(0,r.jsx)(n.code,{children:"mutationKey"}),"."]}),(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"mutation.mutate(...)"})," will accept the ",(0,r.jsx)(n.code,{children:"body"})," of the request\nas the single argument."]}),"\n"]}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",metastring:'title="src/EntityEditForm.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nconst qraft = createAPIClient();\n\nfunction EntityEditForm({ entityId }: { entityId: string }) {\n  const mutation = qraft.entities.entitiesIdDocuments.useMutation({\n    path: {\n      entity_id: entityId\n    },\n    header: {\n      'x-monite-version': '2023-09-01',\n    },\n  });\n\n  return (\n    <form\n      onSubmit={(event) => {\n        event.preventDefault();\n        const formData = new FormData(event.currentTarget);\n        /**\n         * `mutation.mutate(...)` triggers the submission of a request:\n         * ###\n         * POST /entities/3e3e-3e3e-3e3e/documents\n         * x-monite-version: 2023-09-01\n         *\n         * {\"company_tax_id_verification\": [\"verification-id\"]}\n         **/\n        mutation.mutate({\n          company_tax_id_verification: [\n            `${formData.get('company_tax_id_verification')}`,\n          ],\n        });\n      }}\n    >\n      <input name=\"company_tax_id_verification\" />\n      <button disabled={mutation.isPending}>Submit</button>\n    </form>\n  );\n}\n"})})]}),(0,r.jsxs)(i.A,{value:"without-known-parameters",label:"No parameters \ud83d\udcd3",children:[(0,r.jsxs)(n.p,{children:["When the ",(0,r.jsx)(n.code,{children:"parameters"})," are not known, the ",(0,r.jsx)(n.code,{children:"useMutation"})," hook can be used without parameters."]}),(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"mutation.mutate(...)"})," will accept the object with ",(0,r.jsx)(n.code,{children:"parameters"})," and ",(0,r.jsx)(n.code,{children:"body"})," of the request as the single argument."]}),"\n"]}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",metastring:'title="src/EntityForm.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nconst qraft = createAPIClient();\n\nfunction EntityForm() {\n  const mutation = qraft.entities.entitiesIdDocuments.useMutation();\n\n  return (\n    <form\n      onSubmit={(event) => {\n        event.preventDefault();\n        const formData = new FormData(event.currentTarget);\n        /**\n         * `mutation.mutate(...)` triggers the submission of a request:\n         * ###\n         * POST /entities/3e3e-3e3e-3e3e/documents\n         * x-monite-version: 2023-09-01\n         *\n         * {\"company_tax_id_verification\": [\"verification-id\"]}\n         **/\n        mutation.mutate({\n          parameters: {\n            path: {\n              entity_id: `${formData.get('entity_id')}`\n            },\n            header: {\n              'x-monite-version': '2023-09-01',\n            },\n          },\n          body: {\n            company_tax_id_verification: [\n              `${formData.get('company_tax_id_verification')}`,\n            ],\n          }\n        });\n      }}\n    >\n      <input name=\"entity_id\" readOnly={mutation.isPending} />\n      <input name=\"company_tax_id_verification\" readOnly={mutation.isPending} />\n      <button disabled={mutation.isPending}>Submit</button>\n    </form>\n  );\n}\n"})})]})]})]})}function m(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>i,x:()=>o});var r=t(3696);const a={},s=r.createContext(a);function i(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);