"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[203],{5869:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>u,default:()=>p,frontMatter:()=>l,metadata:()=>c,toc:()=>o});var r=n(2540),s=n(3023),i=n(8296),a=n(2491);const l={sidebar_label:"setQueriesData"},u="setQueriesData(...)",c={id:"query-client/setQueriesData",title:"setQueriesData(...)",description:"The synchronous function that can be used to immediately update cached data of multiple queries by using filter.",source:"@site/docs/query-client/setQueriesData.mdx",sourceDirName:"query-client",slug:"/query-client/setQueriesData",permalink:"/openapi-qraft/docs/query-client/setQueriesData",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/query-client/setQueriesData.mdx",tags:[],version:"current",frontMatter:{sidebar_label:"setQueriesData"},sidebar:"mainDocsSidebar",previous:{title:"setInfiniteQueryData",permalink:"/openapi-qraft/docs/query-client/setInfiniteQueryData"},next:{title:"setQueryData",permalink:"/openapi-qraft/docs/query-client/setQueryData"}},d={},o=[{value:"Arguments",id:"arguments",level:2},{value:"Arguments",id:"arguments-1",level:2},{value:"Returns",id:"returns",level:2},{value:"Example",id:"example",level:2}];function h(e){const t={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h1,{id:"setqueriesdata",children:"setQueriesData(...)"}),"\n",(0,r.jsxs)(t.p,{children:["The synchronous function that can be used to immediately update cached data of multiple queries by using filter.\nOnly queries that match the passed ",(0,r.jsx)(t.em,{children:"QueryKey"})," will be updated. ",(0,r.jsx)(t.em,{children:"No"})," new cache entries will be created.\nSee the TanStack ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientsetqueriesdata",children:(0,r.jsx)(t.em,{children:"queryClient.setQueriesData \ud83c\udf34"})})," documentation."]}),"\n",(0,r.jsxs)(i.A,{children:[(0,r.jsxs)(a.A,{value:"without-options",label:(0,r.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["Without ",(0,r.jsx)(t.code,{children:"options"})]}),default:!0,children:[(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-ts",children:"const data = qraft.<service>.<operation>.setQueriesData(\n  filters,\n  updater,\n  queryClient\n);\n"})}),(0,r.jsx)(t.h2,{id:"arguments",children:"Arguments"}),(0,r.jsxs)(t.ol,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters: QueryFiltersByParameters | QueryFiltersByQueryKey"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Required"}),", represents the ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,r.jsx)(t.em,{children:"Query Filters \ud83c\udf34"})}),"\nto be used, strictly-typed \u2728"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering queries by parameters"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters.infinite: boolean"})," will be used to filter infinite or normal queries"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters.queryKey: QueryKey"})," will be used for filtering queries by ",(0,r.jsx)(t.em,{children:"QueryKey"})," instead of parameters","\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters.queryKey"})," and ",(0,r.jsx)(t.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters.predicate?: (query: Query) => boolean"})," will be used for filtering queries by custom predicate"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"updater: TData | (oldData: TData | undefined) => TData | undefined"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Required"})," updater to be used to set the data in the ",(0,r.jsx)(t.em,{children:"Query Cache"})]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"queryClient: QueryClient"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Required"})," ",(0,r.jsx)(t.code,{children:"QueryClient"})," instance to use"]}),"\n"]}),"\n"]}),"\n"]})]}),(0,r.jsxs)(a.A,{value:"with-options",label:(0,r.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["With ",(0,r.jsx)(t.code,{children:"options"})]}),children:[(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-ts",children:"const data = qraft.<service>.<operation>.setQueriesData(\n  filters,\n  updater,\n  options,\n  queryClient\n);\n"})}),(0,r.jsx)(t.h2,{id:"arguments-1",children:"Arguments"}),(0,r.jsxs)(t.ol,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters: QueryFiltersByParameters | QueryFiltersByQueryKey"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Required"}),", represents the ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,r.jsx)(t.em,{children:"Query Filters \ud83c\udf34"})}),"\nto be used, strictly-typed \u2728"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering queries by parameters"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters.infinite: boolean"})," will be used to filter infinite or normal queries"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters.queryKey: QueryKey"})," will be used for filtering queries by ",(0,r.jsx)(t.em,{children:"QueryKey"})," instead of parameters","\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters.queryKey"})," and ",(0,r.jsx)(t.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"filters.predicate?: (query: Query) => boolean"})," will be used for filtering queries by custom predicate"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"updater: TData | (oldData: TData | undefined) => TData | undefined"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Required"})," updater to be used to set the data in the ",(0,r.jsx)(t.em,{children:"Query Cache"})]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"options: SetQueryDataOptions"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Required"})," options to set the data in the cache"]}),"\n",(0,r.jsxs)(t.li,{children:["See the TanStack ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientsetquerydata",children:(0,r.jsx)(t.em,{children:"queryClient.setQueriesData \ud83c\udf34"})})," documentation."]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"queryClient: QueryClient"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Required"})," ",(0,r.jsx)(t.code,{children:"QueryClient"})," instance to use"]}),"\n"]}),"\n"]}),"\n"]})]})]}),"\n",(0,r.jsx)(t.h2,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.code,{children:"Array<TData | undefined>"})," - The data that was set in the cache."]}),"\n",(0,r.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,r.jsxs)(i.A,{children:[(0,r.jsx)(a.A,{value:"without-options",label:(0,r.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["Without ",(0,r.jsx)(t.code,{children:"options"})]}),children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",children:"const parameters = { path: { petId: 123 } };\n\nqraft.pet.getPetById.setQueriesData(\n  { parameters, infinite: false },\n  { id: 123, name: 'Rex' },\n  queryClient\n);\n\nconst pet = qraft.pet.getPetById.getQueryData(\n  parameters,\n  queryClient\n);\n\nexpect(pet).toEqual({\n  id: 123,\n  name: 'Rex',\n});\n"})})}),(0,r.jsx)(a.A,{value:"with-options",label:(0,r.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["With ",(0,r.jsx)(t.code,{children:"options"})]}),children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",children:"const pets = qraft.pet.getPetById.setQueriesData(\n  { parameters: { path: { petId: 123 } }, infinite: false },\n  { id: 123, name: 'Rex' },\n  { updatedAt: Date.now() - 60_000 },\n  queryClient\n);\n"})})}),(0,r.jsxs)(a.A,{value:"with-query-key",label:(0,r.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["With ",(0,r.jsx)(t.code,{children:"QueryKey"})]}),children:[(0,r.jsxs)(t.p,{children:["It's also possible to use a ",(0,r.jsx)(t.code,{children:"QueryKey"})," as an array instead of an object with ",(0,r.jsx)(t.code,{children:"{path, query, header}"}),":"]}),(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",children:"const pets = qraft.pet.getPetById.setQueriesData(\n  {\n    queryKey: [\n      { method: 'get', url: '/pet/{petId}', infinite: false },\n      { petId: 123 },\n    ],\n  },\n  { id: 123, name: 'Rex' },\n  queryClient\n);\n"})})]})]})]})}function p(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},2491:(e,t,n)=>{n.d(t,{A:()=>a});n(3696);var r=n(1750);const s={tabItem:"tabItem_wHwb"};var i=n(2540);function a(e){let{children:t,hidden:n,className:a}=e;return(0,i.jsx)("div",{role:"tabpanel",className:(0,r.A)(s.tabItem,a),hidden:n,children:t})}},8296:(e,t,n)=>{n.d(t,{A:()=>v});var r=n(3696),s=n(1750),i=n(766),a=n(9519),l=n(4395),u=n(5043),c=n(4544),d=n(8708);function o(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??function(e){return o(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:s}}=e;return{value:t,label:n,attributes:r,default:s}}))}(n);return function(e){const t=(0,c.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function p(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function x(e){let{queryString:t=!1,groupId:n}=e;const s=(0,a.W6)(),i=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,u.aZ)(i),(0,r.useCallback)((e=>{if(!i)return;const t=new URLSearchParams(s.location.search);t.set(i,e),s.replace({...s.location,search:t.toString()})}),[i,s])]}function f(e){const{defaultValue:t,queryString:n=!1,groupId:s}=e,i=h(e),[a,u]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!p({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:i}))),[c,o]=x({queryString:n,groupId:s}),[f,y]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[s,i]=(0,d.Dv)(n);return[s,(0,r.useCallback)((e=>{n&&i.set(e)}),[n,i])]}({groupId:s}),m=(()=>{const e=c??f;return p({value:e,tabValues:i})?e:null})();(0,l.A)((()=>{m&&u(m)}),[m]);return{selectedValue:a,selectValue:(0,r.useCallback)((e=>{if(!p({value:e,tabValues:i}))throw new Error(`Can't select invalid tab value=${e}`);u(e),o(e),y(e)}),[o,y,i]),tabValues:i}}var y=n(6681);const m={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var j=n(2540);function b(e){let{className:t,block:n,selectedValue:r,selectValue:a,tabValues:l}=e;const u=[],{blockElementScrollPositionUntilNextRender:c}=(0,i.a_)(),d=e=>{const t=e.currentTarget,n=u.indexOf(t),s=l[n].value;s!==r&&(c(t),a(s))},o=e=>{let t=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const n=u.indexOf(e.currentTarget)+1;t=u[n]??u[0];break}case"ArrowLeft":{const n=u.indexOf(e.currentTarget)-1;t=u[n]??u[u.length-1];break}}t?.focus()};return(0,j.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.A)("tabs",{"tabs--block":n},t),children:l.map((e=>{let{value:t,label:n,attributes:i}=e;return(0,j.jsx)("li",{role:"tab",tabIndex:r===t?0:-1,"aria-selected":r===t,ref:e=>u.push(e),onKeyDown:o,onClick:d,...i,className:(0,s.A)("tabs__item",m.tabItem,i?.className,{"tabs__item--active":r===t}),children:n??t},t)}))})}function q(e){let{lazy:t,children:n,selectedValue:s}=e;const i=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=i.find((e=>e.props.value===s));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return(0,j.jsx)("div",{className:"margin-top--md",children:i.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==s})))})}function g(e){const t=f(e);return(0,j.jsxs)("div",{className:(0,s.A)("tabs-container",m.tabList),children:[(0,j.jsx)(b,{...e,...t}),(0,j.jsx)(q,{...e,...t})]})}function v(e){const t=(0,y.A)();return(0,j.jsx)(g,{...e,children:o(e.children)},String(t))}},3023:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>l});var r=n(3696);const s={},i=r.createContext(s);function a(e){const t=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function l(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),r.createElement(i.Provider,{value:t},e.children)}}}]);