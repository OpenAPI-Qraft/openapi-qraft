"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[2755],{1208:(e,t,n)=>{n.d(t,{A:()=>l});n(3696);var r=n(2689);const i={tabItem:"tabItem_wHwb"};var s=n(2540);function l(e){let{children:t,hidden:n,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,r.A)(i.tabItem,l),hidden:n,children:t})}},9515:(e,t,n)=>{n.d(t,{A:()=>q});var r=n(3696),i=n(2689),s=n(3447),l=n(9519),a=n(6960),c=n(9624),u=n(6953),o=n(9866);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??function(e){return d(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:i}}=e;return{value:t,label:n,attributes:r,default:i}}))}(n);return function(e){const t=(0,u.XI)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function m(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function f(e){let{queryString:t=!1,groupId:n}=e;const i=(0,l.W6)(),s=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,c.aZ)(s),(0,r.useCallback)((e=>{if(!s)return;const t=new URLSearchParams(i.location.search);t.set(s,e),i.replace({...i.location,search:t.toString()})}),[s,i])]}function p(e){const{defaultValue:t,queryString:n=!1,groupId:i}=e,s=h(e),[l,c]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!m({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:s}))),[u,d]=f({queryString:n,groupId:i}),[p,x]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[i,s]=(0,o.Dv)(n);return[i,(0,r.useCallback)((e=>{n&&s.set(e)}),[n,s])]}({groupId:i}),j=(()=>{const e=u??p;return m({value:e,tabValues:s})?e:null})();(0,a.A)((()=>{j&&c(j)}),[j]);return{selectedValue:l,selectValue:(0,r.useCallback)((e=>{if(!m({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);c(e),d(e),x(e)}),[d,x,s]),tabValues:s}}var x=n(9244);const j={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var b=n(2540);function g(e){let{className:t,block:n,selectedValue:r,selectValue:l,tabValues:a}=e;const c=[],{blockElementScrollPositionUntilNextRender:u}=(0,s.a_)(),o=e=>{const t=e.currentTarget,n=c.indexOf(t),i=a[n].value;i!==r&&(u(t),l(i))},d=e=>{let t=null;switch(e.key){case"Enter":o(e);break;case"ArrowRight":{const n=c.indexOf(e.currentTarget)+1;t=c[n]??c[0];break}case"ArrowLeft":{const n=c.indexOf(e.currentTarget)-1;t=c[n]??c[c.length-1];break}}t?.focus()};return(0,b.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.A)("tabs",{"tabs--block":n},t),children:a.map((e=>{let{value:t,label:n,attributes:s}=e;return(0,b.jsx)("li",{role:"tab",tabIndex:r===t?0:-1,"aria-selected":r===t,ref:e=>c.push(e),onKeyDown:d,onClick:o,...s,className:(0,i.A)("tabs__item",j.tabItem,s?.className,{"tabs__item--active":r===t}),children:n??t},t)}))})}function y(e){let{lazy:t,children:n,selectedValue:s}=e;const l=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=l.find((e=>e.props.value===s));return e?(0,r.cloneElement)(e,{className:(0,i.A)("margin-top--md",e.props.className)}):null}return(0,b.jsx)("div",{className:"margin-top--md",children:l.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==s})))})}function v(e){const t=p(e);return(0,b.jsxs)("div",{className:(0,i.A)("tabs-container",j.tabList),children:[(0,b.jsx)(g,{...t,...e}),(0,b.jsx)(y,{...t,...e})]})}function q(e){const t=(0,x.A)();return(0,b.jsx)(v,{...e,children:d(e.children)},String(t))}},9177:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>u,default:()=>m,frontMatter:()=>c,metadata:()=>r,toc:()=>d});const r=JSON.parse('{"id":"query-client/isMutating","title":"isMutating(...)","description":"This method returns an integer representing how many mutations are currently in the loading state.","source":"@site/versioned_docs/version-1.x/query-client/isMutating.mdx","sourceDirName":"query-client","slug":"/query-client/isMutating","permalink":"/openapi-qraft/docs/1.x/query-client/isMutating","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/versioned_docs/version-1.x/query-client/isMutating.mdx","tags":[],"version":"1.x","frontMatter":{"sidebar_label":"isMutating()"},"sidebar":"mainDocsSidebar","previous":{"title":"isFetching()","permalink":"/openapi-qraft/docs/1.x/query-client/isFetching"},"next":{"title":"prefetchInfiniteQuery()","permalink":"/openapi-qraft/docs/1.x/query-client/prefetchInfiniteQuery"}}');var i=n(2540),s=n(3023),l=n(9515),a=n(1208);const c={sidebar_label:"isMutating()"},u="isMutating(...)",o={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Arguments",id:"arguments-1",level:3},{value:"Returns",id:"returns-1",level:3},{value:"Examples",id:"examples",level:3}];function h(e){const t={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.header,{children:(0,i.jsx)(t.h1,{id:"ismutating",children:"isMutating(...)"})}),"\n",(0,i.jsxs)(t.p,{children:["This method returns an integer representing how many mutations are currently in the ",(0,i.jsx)(t.em,{children:"loading"})," state.\nRefer to the TanStack ",(0,i.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientismutating",children:(0,i.jsx)(t.em,{children:"queryClient.isMutating \ud83c\udf34"})}),"\nguide for more information."]}),"\n",(0,i.jsxs)(l.A,{children:[(0,i.jsxs)(a.A,{value:"with-filters",label:(0,i.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["With ",(0,i.jsx)(t.code,{children:"filters"})]}),children:[(0,i.jsxs)(t.p,{children:["Checks if any mutations are fetching with the specified ",(0,i.jsx)(t.em,{children:"filters"}),"."]}),(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-ts",children:"const mutationNumber = qraft.<service>.<operation>.isMutating(\n  filters,\n  queryClient,\n)\n"})}),(0,i.jsx)(t.h3,{id:"arguments",children:"Arguments"}),(0,i.jsxs)(t.ol,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"filters: UseMutationStateFiltersByParameters | UseMutationStateFiltersByMutationKey"}),",","\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Required"}),", represents the ",(0,i.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#mutation-filters",children:(0,i.jsx)(t.em,{children:"Mutation Filters \ud83c\udf34"})}),"\nto be used, strictly-typed \u2728"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering mutations by parameters"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"filters.mutationKey: MutationKey"})," will be used for filtering mutations by ",(0,i.jsx)(t.em,{children:"MutationKey"})," instead of parameters","\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"filters.mutationKey"})," and ",(0,i.jsx)(t.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"filters.predicate?: (mutation: Mutation) => boolean"})," will be used for filtering mutations by custom predicate"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"queryClient?: QueryClient"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Optional"})," ",(0,i.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,i.jsx)(t.em,{children:"QueryClient \ud83c\udf34"})})," to be used"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.em,{children:"If not provided"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"QraftContext.queryClient"})," will be used if available"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useQueryClient",children:(0,i.jsx)(t.em,{children:"useQueryClient() \ud83c\udf34"})}),"\nresult will be used as a fallback"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),(0,i.jsx)(t.h3,{id:"returns",children:"Returns"}),(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.code,{children:"mutationsNumber"}),": The number of mutations that are matching the provided filters and are in the ",(0,i.jsx)(t.em,{children:"loading"})," state"]})]}),(0,i.jsxs)(a.A,{value:"without-filters",label:(0,i.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["Without ",(0,i.jsx)(t.code,{style:{textDecoration:"line-through"},children:"filters"})]}),children:[(0,i.jsxs)(t.p,{children:["Check ",(0,i.jsx)(t.em,{children:"all"})," mutations for the specified endpoint."]}),(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-ts",children:"const mutationNumber = qraft.<service>.<operation>.isMutating(\n  queryClient,\n)\n"})}),(0,i.jsx)(t.h3,{id:"arguments-1",children:"Arguments"}),(0,i.jsxs)(t.ol,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"queryClient?: QueryClient"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Optional"})," ",(0,i.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,i.jsx)(t.em,{children:"QueryClient \ud83c\udf34"})})," to be used"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.em,{children:"If not provided"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"QraftContext.queryClient"})," will be used if available"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useQueryClient",children:(0,i.jsx)(t.em,{children:"useQueryClient() \ud83c\udf34"})}),"\nresult will be used as a fallback"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),(0,i.jsx)(t.h3,{id:"returns-1",children:"Returns"}),(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.code,{children:"mutationsNumber"}),": The number of all mutations matching to ",(0,i.jsx)(t.code,{children:"<service>.<operation>"})," and are in the ",(0,i.jsx)(t.em,{children:"loading"})," state"]})]})]}),"\n",(0,i.jsx)(t.h3,{id:"examples",children:"Examples"}),"\n",(0,i.jsxs)(l.A,{children:[(0,i.jsxs)(a.A,{value:"with-filters",label:(0,i.jsx)(t.span,{style:{verticalAlign:"middle"},children:(0,i.jsx)(t.code,{children:"filters"})}),children:[(0,i.jsx)(t.p,{children:"Check if any mutations are pending with the specified parameters:"}),(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-ts",children:"/**\n* Checks if the mutation with the specified parameters is fetching:\n* ###\n* POST /entities/3e3e-3e3e-3e3e\n* x-monite-version: 2023-09-01\n**/\nconst numberOfFetchingEntities = qraft.entities.postEntities.isMutating(\n  {\n    header: {\n      'x-monite-version': '2023-09-01',\n    },\n    path: {\n      entity_id: '3e3e-3e3e-3e3e',\n    },\n  },\n  queryClient\n);\n\nexpect(numberOfFetchingEntities).toEqual(1);\n"})})]}),(0,i.jsxs)(a.A,{value:"without-filters",label:(0,i.jsx)(t.span,{style:{verticalAlign:"middle"},children:(0,i.jsx)(t.code,{style:{textDecoration:"line-through"},children:"filters"})}),children:[(0,i.jsxs)(t.p,{children:["To check ",(0,i.jsx)(t.em,{children:"all mutations status for a particular endpoint"}),", you can call ",(0,i.jsx)(t.code,{children:"isMutating(...)"})," without ",(0,i.jsx)(t.code,{children:"parameters"}),":"]}),(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-ts",children:"/**\n * Checks mutations matching the specified endpoint:\n * ###\n * POST /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n * ###\n * POST /entities/4c4c-4c4c-4c4c\n * x-monite-version: 2023-09-01\n * ###\n * \u2b07\ufe0e All mutations for the specified endpoint will be used\n **/\nconst numberOfFetchingEntities = qraft.entities.postEntities.isMutating(queryClient);\n\nexpect(numberOfFetchingEntities).toEqual(2);\n"})})]})]})]})}function m(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},3023:(e,t,n)=>{n.d(t,{R:()=>l,x:()=>a});var r=n(3696);const i={},s=r.createContext(i);function l(e){const t=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function a(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),r.createElement(s.Provider,{value:t},e.children)}}}]);