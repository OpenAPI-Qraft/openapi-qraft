"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[7756],{9393:(e,r,t)=>{t.d(r,{A:()=>l});t(3696);var n=t(1750);const i={tabItem:"tabItem_wHwb"};var s=t(2540);function l(e){let{children:r,hidden:t,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,n.A)(i.tabItem,l),hidden:t,children:r})}},9942:(e,r,t)=>{t.d(r,{A:()=>v});var n=t(3696),i=t(1750),s=t(5162),l=t(9519),a=t(5367),c=t(271),o=t(5476),u=t(5095);function d(e){return n.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,n.isValidElement)(e)&&function(e){const{props:r}=e;return!!r&&"object"==typeof r&&"value"in r}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:r,children:t}=e;return(0,n.useMemo)((()=>{const e=r??function(e){return d(e).map((e=>{let{props:{value:r,label:t,attributes:n,default:i}}=e;return{value:r,label:t,attributes:n,default:i}}))}(t);return function(e){const r=(0,o.XI)(e,((e,r)=>e.value===r.value));if(r.length>0)throw new Error(`Docusaurus error: Duplicate values "${r.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[r,t])}function f(e){let{value:r,tabValues:t}=e;return t.some((e=>e.value===r))}function p(e){let{queryString:r=!1,groupId:t}=e;const i=(0,l.W6)(),s=function(e){let{queryString:r=!1,groupId:t}=e;if("string"==typeof r)return r;if(!1===r)return null;if(!0===r&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:r,groupId:t});return[(0,c.aZ)(s),(0,n.useCallback)((e=>{if(!s)return;const r=new URLSearchParams(i.location.search);r.set(s,e),i.replace({...i.location,search:r.toString()})}),[s,i])]}function x(e){const{defaultValue:r,queryString:t=!1,groupId:i}=e,s=h(e),[l,c]=(0,n.useState)((()=>function(e){let{defaultValue:r,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(r){if(!f({value:r,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${r}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return r}const n=t.find((e=>e.default))??t[0];if(!n)throw new Error("Unexpected error: 0 tabValues");return n.value}({defaultValue:r,tabValues:s}))),[o,d]=p({queryString:t,groupId:i}),[x,m]=function(e){let{groupId:r}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(r),[i,s]=(0,u.Dv)(t);return[i,(0,n.useCallback)((e=>{t&&s.set(e)}),[t,s])]}({groupId:i}),y=(()=>{const e=o??x;return f({value:e,tabValues:s})?e:null})();(0,a.A)((()=>{y&&c(y)}),[y]);return{selectedValue:l,selectValue:(0,n.useCallback)((e=>{if(!f({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);c(e),d(e),m(e)}),[d,m,s]),tabValues:s}}var m=t(1173);const y={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var j=t(2540);function b(e){let{className:r,block:t,selectedValue:n,selectValue:l,tabValues:a}=e;const c=[],{blockElementScrollPositionUntilNextRender:o}=(0,s.a_)(),u=e=>{const r=e.currentTarget,t=c.indexOf(r),i=a[t].value;i!==n&&(o(r),l(i))},d=e=>{let r=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const t=c.indexOf(e.currentTarget)+1;r=c[t]??c[0];break}case"ArrowLeft":{const t=c.indexOf(e.currentTarget)-1;r=c[t]??c[c.length-1];break}}r?.focus()};return(0,j.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.A)("tabs",{"tabs--block":t},r),children:a.map((e=>{let{value:r,label:t,attributes:s}=e;return(0,j.jsx)("li",{role:"tab",tabIndex:n===r?0:-1,"aria-selected":n===r,ref:e=>c.push(e),onKeyDown:d,onClick:u,...s,className:(0,i.A)("tabs__item",y.tabItem,s?.className,{"tabs__item--active":n===r}),children:t??r},r)}))})}function g(e){let{lazy:r,children:t,selectedValue:s}=e;const l=(Array.isArray(t)?t:[t]).filter(Boolean);if(r){const e=l.find((e=>e.props.value===s));return e?(0,n.cloneElement)(e,{className:(0,i.A)("margin-top--md",e.props.className)}):null}return(0,j.jsx)("div",{className:"margin-top--md",children:l.map(((e,r)=>(0,n.cloneElement)(e,{key:r,hidden:e.props.value!==s})))})}function q(e){const r=x(e);return(0,j.jsxs)("div",{className:(0,i.A)("tabs-container",y.tabList),children:[(0,j.jsx)(b,{...r,...e}),(0,j.jsx)(g,{...r,...e})]})}function v(e){const r=(0,m.A)();return(0,j.jsx)(q,{...e,children:d(e.children)},String(r))}},6495:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>u,contentTitle:()=>c,default:()=>f,frontMatter:()=>a,metadata:()=>o,toc:()=>d});var n=t(2540),i=t(3023),s=t(9942),l=t(9393);const a={sidebar_label:"refetchQueries()"},c="refetchQueries(...)",o={id:"query-client/refetchQueries",title:"refetchQueries(...)",description:"The method can be used to refetch queries based on certain conditions.",source:"@site/docs/query-client/refetchQueries.mdx",sourceDirName:"query-client",slug:"/query-client/refetchQueries",permalink:"/openapi-qraft/docs/next/query-client/refetchQueries",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/query-client/refetchQueries.mdx",tags:[],version:"current",frontMatter:{sidebar_label:"refetchQueries()"},sidebar:"mainDocsSidebar",previous:{title:"prefetchQuery()",permalink:"/openapi-qraft/docs/next/query-client/prefetchQuery"},next:{title:"removeQueries()",permalink:"/openapi-qraft/docs/next/query-client/removeQueries"}},u={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Arguments",id:"arguments-1",level:3},{value:"Returns",id:"returns",level:3},{value:"Examples",id:"examples",level:3}];function h(e){const r={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.header,{children:(0,n.jsx)(r.h1,{id:"refetchqueries",children:"refetchQueries(...)"})}),"\n",(0,n.jsxs)(r.p,{children:["The method can be used to refetch queries based on certain conditions.\nSee also the TanStack ",(0,n.jsx)(r.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientrefetchqueries",children:(0,n.jsx)(r.em,{children:"queryClient.refetchQueries(...) \ud83c\udf34"})})," documentation."]}),"\n",(0,n.jsxs)(s.A,{children:[(0,n.jsxs)(l.A,{value:"with-filters-no-options",label:(0,n.jsxs)(r.span,{style:{verticalAlign:"middle"},children:["With ",(0,n.jsx)(r.code,{children:"filters"}),", ",(0,n.jsx)(r.code,{style:{textDecoration:"line-through"},children:"options"})]}),children:[(0,n.jsx)(r.p,{children:"Refetches queries for the specified endpoint using the provided filters."}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-ts",children:"qraft.<service>.<operation>.refetchQueries(\n  filters\n)\n"})}),(0,n.jsx)(r.h3,{id:"arguments",children:"Arguments"}),(0,n.jsxs)(r.ol,{children:["\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters: QueryFiltersByParameters | QueryFiltersByQueryKey"}),"\n",(0,n.jsxs)(r.ul,{children:["\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:"Required"}),", represents the ",(0,n.jsx)(r.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,n.jsx)(r.em,{children:"Query Filters \ud83c\udf34"})}),"\nto be used, strictly-typed \u2728"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering queries by parameters"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters.infinite: boolean"})," will be used to filter infinite or normal queries"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters.queryKey: QueryKey"})," will be used for filtering queries by ",(0,n.jsx)(r.em,{children:"QueryKey"})," instead of parameters","\n",(0,n.jsxs)(r.ul,{children:["\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters.queryKey"})," and ",(0,n.jsx)(r.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters.predicate?: (query: Query) => boolean"})," will be used for filtering queries by custom predicate"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.em,{children:"If not provided"}),"\n",(0,n.jsxs)(r.ul,{children:["\n",(0,n.jsx)(r.li,{children:"All queries for the specified endpoint will be refetched"}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]})]}),(0,n.jsxs)(l.A,{value:"with-filter-and-options",label:(0,n.jsxs)(r.span,{style:{verticalAlign:"middle"},children:["With ",(0,n.jsx)(r.code,{children:"filters"}),", ",(0,n.jsx)(r.code,{children:"options"})]}),children:[(0,n.jsx)(r.p,{children:"Refetches queries for the specified endpoint using the provided filters with the specified options."}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-ts",children:"qraft.<service>.<operation>.refetchQueries(\n  filters,\n  options\n)\n"})}),(0,n.jsx)(r.h3,{id:"arguments-1",children:"Arguments"}),(0,n.jsxs)(r.ol,{children:["\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters: QueryFiltersByParameters | QueryFiltersByQueryKey"}),"\n",(0,n.jsxs)(r.ul,{children:["\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:"Required"}),", represents the ",(0,n.jsx)(r.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,n.jsx)(r.em,{children:"Query Filters \ud83c\udf34"})}),"\nto be used, strictly-typed \u2728"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering queries by parameters"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters.infinite: boolean"})," will be used to filter infinite or normal queries"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters.queryKey: QueryKey"})," will be used for filtering queries by ",(0,n.jsx)(r.em,{children:"QueryKey"})," instead of parameters","\n",(0,n.jsxs)(r.ul,{children:["\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters.queryKey"})," and ",(0,n.jsx)(r.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"filters.predicate?: (query: Query) => boolean"})," will be used for filtering queries by custom predicate"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.em,{children:"If not provided"}),"\n",(0,n.jsxs)(r.ul,{children:["\n",(0,n.jsx)(r.li,{children:"All queries for the specified endpoint will be refetched"}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"options: RefetchOptions"}),"\n",(0,n.jsxs)(r.ul,{children:["\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:"Required"}),", see ",(0,n.jsx)(r.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientrefetchqueries",children:(0,n.jsx)(r.em,{children:"queryClient.refetchQueries(...) \ud83c\udf34"})})," for more details\nto be used"]}),"\n"]}),"\n"]}),"\n"]})]}),(0,n.jsxs)(l.A,{value:"without-filters",label:(0,n.jsxs)(r.span,{style:{verticalAlign:"middle"},children:["No ",(0,n.jsx)(r.code,{style:{textDecoration:"line-through"},children:"filters"}),", ",(0,n.jsx)(r.code,{style:{textDecoration:"line-through"},children:"options"})]}),children:[(0,n.jsxs)(r.p,{children:["Refetches ",(0,n.jsx)(r.em,{children:"all"})," normal and ",(0,n.jsx)(r.em,{children:"Infinite"})," queries for the specified endpoint."]}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-ts",children:"qraft.<service>.<operation>.refetchQueries()\n"})})]})]}),"\n",(0,n.jsx)(r.h3,{id:"returns",children:"Returns"}),"\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:"Promise<void>"}),": A promise that resolves once the refetching is complete."]}),"\n",(0,n.jsx)(r.h3,{id:"examples",children:"Examples"}),"\n",(0,n.jsxs)(s.A,{children:[(0,n.jsxs)(l.A,{value:"with-filters",label:(0,n.jsx)(r.span,{style:{verticalAlign:"middle"},children:(0,n.jsx)(r.code,{children:"filters"})}),children:[(0,n.jsx)(r.p,{children:"Queries refetching with the specified parameters:"}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-ts",children:"/**\n * Active queries with the specified parameters will be refetched:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n **/\nqraft.entities.getEntities.refetchQueries(\n  {\n    infinite: false,\n    parameters: {\n      header: {\n        'x-monite-version': '2023-09-01',\n      },\n      path: {\n        entity_id: '3e3e-3e3e-3e3e',\n      },\n    },\n  }\n);\n"})})]}),(0,n.jsxs)(l.A,{value:"without-filters",label:(0,n.jsx)(r.span,{style:{verticalAlign:"middle"},children:(0,n.jsx)(r.code,{style:{textDecoration:"line-through"},children:"filters"})}),children:[(0,n.jsxs)(r.p,{children:["To refetch ",(0,n.jsx)(r.em,{children:"all queries for a particular endpoint"}),", you can call ",(0,n.jsx)(r.code,{children:"refetchQueries(...)"})," without ",(0,n.jsx)(r.code,{children:"parameters"}),":"]}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-ts",children:"/**\n * Refetches queries matching the specified endpoint:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n * ###\n * GET /entities/4c4c-4c4c-4c4c\n * x-monite-version: 2023-09-01\n * ###\n * \u2b07\ufe0e All queries for the specified endpoint will be refetched\n **/\nqraft.entities.getEntities.refetchQueries();\n"})})]}),(0,n.jsxs)(l.A,{value:"with-predicate",label:(0,n.jsx)(r.span,{style:{verticalAlign:"middle"},children:(0,n.jsx)(r.code,{children:"predicate"})}),children:[(0,n.jsxs)(r.p,{children:["Refetches queries with a custom ",(0,n.jsx)(r.code,{children:"predicate(...)"})," function,\nwhich will be used as a final filter on all matching queries.\nSee ",(0,n.jsx)(r.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,n.jsx)(r.em,{children:"Query Filters \ud83c\udf34"})}),"\nfor more information."]}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-ts",children:"/**\n * Refetches queries matching the specified endpoint and predicate:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n **/\nqraft.entities.getEntities.refetchQueries(\n  {\n    infinite: false,\n    parameters, // * optional, or specific parameters, alternatively, you can use `queryKey`\n    predicate: (query) => {\n      // `queryKey`\u2b07\ufe0e is fully typed to `qraft.entities.getEntities` operation parameters\n      if (query.queryKey[1].path.entity_id === '4c4c-4c4c-4c4c') return false;\n\n      return true;\n    },\n  }\n);\n"})})]}),(0,n.jsxs)(l.A,{value:"with-query-key",label:(0,n.jsx)(r.span,{style:{verticalAlign:"middle"},children:(0,n.jsx)(r.code,{children:"queryKey"})}),children:[(0,n.jsxs)(r.p,{children:["It could be useful to refetch queries using ",(0,n.jsx)(r.code,{children:"queryKey"})," directly:"]}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-ts",children:"/**\n * Refetches queries matching the specified endpoint:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n **/\nqraft.entities.getEntities.refetchQueries(\n  {\n    // `queryKey` is fully typed to `qraft.entities.getEntities`\n    queryKey: qraft.entities.getEntities.getQueryKey({\n      header: {\n        'x-monite-version': '2023-09-01',\n      },\n      path: {\n        entity_id: '3e3e-3e3e-3e3e',\n      },\n    }),\n  }\n);\n"})})]})]})]})}function f(e={}){const{wrapper:r}={...(0,i.R)(),...e.components};return r?(0,n.jsx)(r,{...e,children:(0,n.jsx)(h,{...e})}):h(e)}},3023:(e,r,t)=>{t.d(r,{R:()=>l,x:()=>a});var n=t(3696);const i={},s=n.createContext(i);function l(e){const r=n.useContext(s);return n.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function a(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),n.createElement(s.Provider,{value:r},e.children)}}}]);