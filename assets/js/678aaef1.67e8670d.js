"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[534],{7679:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>o,contentTitle:()=>a,default:()=>f,frontMatter:()=>c,metadata:()=>u,toc:()=>d});var t=r(2540),i=r(3023),s=r(8296),l=r(2491);const c={sidebar_label:"cancelQueries"},a="cancelQueries(...)",u={id:"query-client/cancelQueries",title:"cancelQueries(...)",description:"The method can be used to cancel outgoing queries. Refer to the TanStack",source:"@site/docs/query-client/cancelQueries.mdx",sourceDirName:"query-client",slug:"/query-client/cancelQueries",permalink:"/openapi-qraft/docs/query-client/cancelQueries",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/query-client/cancelQueries.mdx",tags:[],version:"current",frontMatter:{sidebar_label:"cancelQueries"},sidebar:"mainDocsSidebar",previous:{title:"useSuspenseQuery",permalink:"/openapi-qraft/docs/hooks/useSuspenseQuery"},next:{title:"fetchInfiniteQuery",permalink:"/openapi-qraft/docs/query-client/fetchInfiniteQuery"}},o={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Arguments",id:"arguments-1",level:3},{value:"Arguments",id:"arguments-2",level:3},{value:"Returns",id:"returns",level:3},{value:"Examples",id:"examples",level:3}];function h(e){const n={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"cancelqueries",children:"cancelQueries(...)"}),"\n",(0,t.jsxs)(n.p,{children:["The method can be used to cancel outgoing queries. Refer to the TanStack\n",(0,t.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientcancelqueries",children:(0,t.jsx)(n.em,{children:"queryClient.cancelQueries \ud83c\udf34"})}),"\nand ",(0,t.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation",children:(0,t.jsx)(n.em,{children:"Query Cancellation \ud83c\udf34"})}),"\nguide for more information."]}),"\n",(0,t.jsxs)(s.A,{children:[(0,t.jsxs)(l.A,{value:"with-filters-no-options",label:(0,t.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["With ",(0,t.jsx)(n.code,{children:"filters"}),", ",(0,t.jsx)(n.code,{style:{textDecoration:"line-through"},children:"options"})]}),children:[(0,t.jsx)(n.p,{children:"Cancels queries for the specified endpoint using the provided filters."}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"qraft.<service>.<operation>.cancelQueries(\n  filters,\n  queryClient,\n)\n"})}),(0,t.jsx)(n.h3,{id:"arguments",children:"Arguments"}),(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters: QueryFiltersByParameters | QueryFiltersByQueryKey"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:"Required"}),", represents the ",(0,t.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,t.jsx)(n.em,{children:"Query Filters \ud83c\udf34"})}),"\nto be used, strictly-typed \u2728"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering queries by parameters"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters.infinite: boolean"})," will be used to filter infinite or normal queries"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters.queryKey: QueryKey"})," will be used for filtering queries by ",(0,t.jsx)(n.em,{children:"QueryKey"})," instead of parameters","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters.queryKey"})," and ",(0,t.jsx)(n.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters.predicate?: (query: Query) => boolean"})," will be used for filtering queries by custom predicate"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.em,{children:"If not provided"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"All queries for the specified endpoint will be canceled"}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"queryClient: QueryClient"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:"Required"})," ",(0,t.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,t.jsx)(n.em,{children:"QueryClient \ud83c\udf34"})})," to be used"]}),"\n"]}),"\n"]}),"\n"]})]}),(0,t.jsxs)(l.A,{value:"with-filter-and-options",label:(0,t.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["With ",(0,t.jsx)(n.code,{children:"filters"}),", ",(0,t.jsx)(n.code,{children:"options"})]}),children:[(0,t.jsx)(n.p,{children:"Cancels queries for the specified endpoint using the provided filters with the specified options."}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"qraft.<service>.<operation>.cancelQueries(\n  filters,\n  options,\n  queryClient,\n)\n"})}),(0,t.jsx)(n.h3,{id:"arguments-1",children:"Arguments"}),(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters: QueryFiltersByParameters | QueryFiltersByQueryKey"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:"Required"}),", represents the ",(0,t.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,t.jsx)(n.em,{children:"Query Filters \ud83c\udf34"})}),"\nto be used, strictly-typed \u2728"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering queries by parameters"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters.infinite: boolean"})," will be used to filter infinite or normal queries"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters.queryKey: QueryKey"})," will be used for filtering queries by ",(0,t.jsx)(n.em,{children:"QueryKey"})," instead of parameters","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters.queryKey"})," and ",(0,t.jsx)(n.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"filters.predicate?: (query: Query) => boolean"})," will be used for filtering queries by custom predicate"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.em,{children:"If not provided"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"All queries for the specified endpoint will be canceled"}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"options: CancelOptions"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:"Required"})," ",(0,t.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientcancelqueries",children:(0,t.jsx)(n.em,{children:"CancelOptions \ud83c\udf34"})}),"\nto be used"]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"queryClient: QueryClient"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:"Required"})," ",(0,t.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,t.jsx)(n.em,{children:"QueryClient \ud83c\udf34"})})," to be used"]}),"\n"]}),"\n"]}),"\n"]})]}),(0,t.jsxs)(l.A,{value:"without-filters",label:(0,t.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["No ",(0,t.jsx)(n.code,{style:{textDecoration:"line-through"},children:"filters"}),", ",(0,t.jsx)(n.code,{style:{textDecoration:"line-through"},children:"options"})]}),children:[(0,t.jsxs)(n.p,{children:["Cancels ",(0,t.jsx)(n.em,{children:"all"})," normal and ",(0,t.jsx)(n.em,{children:"Infinite"})," queries for the specified endpoint."]}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"qraft.<service>.<operation>.cancelQueries(\n  queryClient,\n)\n"})}),(0,t.jsx)(n.h3,{id:"arguments-2",children:"Arguments"}),(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"queryClient: QueryClient"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:"Required"})," ",(0,t.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,t.jsx)(n.em,{children:"QueryClient \ud83c\udf34"})})," to be used"]}),"\n"]}),"\n"]}),"\n"]})]})]}),"\n",(0,t.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"Promise<void>"}),": A promise that resolves once the cancellation is complete."]}),"\n",(0,t.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,t.jsxs)(s.A,{children:[(0,t.jsxs)(l.A,{value:"with-filters",label:(0,t.jsx)(n.span,{style:{verticalAlign:"middle"},children:(0,t.jsx)(n.code,{children:"filters"})}),children:[(0,t.jsx)(n.p,{children:"Queries cancellation with the specified parameters:"}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"/**\n * Will cancel the active queries with the specified parameters:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n **/\nqraft.entities.getEntities.cancelQueries(\n  {\n    infinite: false,\n    parameters: {\n      header: {\n        'x-monite-version': '2023-09-01',\n      },\n      path: {\n        entity_id: '3e3e-3e3e-3e3e',\n      },\n    },\n  },\n  queryClient\n);\n"})})]}),(0,t.jsxs)(l.A,{value:"without-filters",label:(0,t.jsx)(n.span,{style:{verticalAlign:"middle"},children:(0,t.jsx)(n.code,{style:{textDecoration:"line-through"},children:"filters"})}),children:[(0,t.jsxs)(n.p,{children:["To cancel ",(0,t.jsx)(n.em,{children:"all queries for a particular endpoint"}),", you can call ",(0,t.jsx)(n.code,{children:"cancelQueries(...)"})," without ",(0,t.jsx)(n.code,{children:"parameters"}),":"]}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"/**\n * Will cancel queries matching the specified endpoint:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n * ###\n * GET /entities/4c4c-4c4c-4c4c\n * x-monite-version: 2023-09-01\n * ###\n * \u2b07\ufe0e All queries for the specified endpoint will be canceled\n **/\nqraft.entities.getEntities.cancelQueries(queryClient);\n"})})]}),(0,t.jsxs)(l.A,{value:"with-predicate",label:(0,t.jsx)(n.span,{style:{verticalAlign:"middle"},children:(0,t.jsx)(n.code,{children:"predicate"})}),children:[(0,t.jsxs)(n.p,{children:["Cancels queries with a custom ",(0,t.jsx)(n.code,{children:"predicate(...)"})," function,\nwhich will be used as a final filter on all matching queries.\nSee ",(0,t.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,t.jsx)(n.em,{children:"Query Filters \ud83c\udf34"})}),"\nfor more information."]}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"/**\n * Will cancel queries matching the specified endpoint and predicate:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n **/\nqraft.entities.getEntities.cancelQueries(\n  {\n    infinite: false,\n    parameters, // * optional, or specific parameters, alternatively, you can use `queryKey`\n    predicate: (query) => {\n      // `queryKey`\u2b07\ufe0e is fully typed to `qraft.entities.getEntities` operation parameters\n      if (query.queryKey[1].path.entity_id === '4c4c-4c4c-4c4c') return false;\n\n      return true;\n    },\n  },\n  queryClient\n);\n"})})]}),(0,t.jsxs)(l.A,{value:"with-query-key",label:(0,t.jsx)(n.span,{style:{verticalAlign:"middle"},children:(0,t.jsx)(n.code,{children:"queryKey"})}),children:[(0,t.jsxs)(n.p,{children:["It could be useful to cancel queries using ",(0,t.jsx)(n.code,{children:"queryKey"})," directly:"]}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"/**\n * Will cancel queries matching the specified endpoint:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n **/\nqraft.entities.getEntities.cancelQueries(\n  {\n    // `queryKey` is fully typed to `qraft.entities.getEntities`\n    queryKey: qraft.entities.getEntities.getQueryKey({\n      header: {\n        'x-monite-version': '2023-09-01',\n      },\n      path: {\n        entity_id: '3e3e-3e3e-3e3e',\n      },\n    }),\n  },\n  queryClient\n);\n"})})]})]})]})}function f(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(h,{...e})}):h(e)}},2491:(e,n,r)=>{r.d(n,{A:()=>l});r(3696);var t=r(1750);const i={tabItem:"tabItem_wHwb"};var s=r(2540);function l(e){let{children:n,hidden:r,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,t.A)(i.tabItem,l),hidden:r,children:n})}},8296:(e,n,r)=>{r.d(n,{A:()=>v});var t=r(3696),i=r(1750),s=r(766),l=r(9519),c=r(4395),a=r(5043),u=r(4544),o=r(8708);function d(e){return t.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,t.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:r}=e;return(0,t.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:r,attributes:t,default:i}}=e;return{value:n,label:r,attributes:t,default:i}}))}(r);return function(e){const n=(0,u.X)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,r])}function f(e){let{value:n,tabValues:r}=e;return r.some((e=>e.value===n))}function p(e){let{queryString:n=!1,groupId:r}=e;const i=(0,l.W6)(),s=function(e){let{queryString:n=!1,groupId:r}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!r)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return r??null}({queryString:n,groupId:r});return[(0,a.aZ)(s),(0,t.useCallback)((e=>{if(!s)return;const n=new URLSearchParams(i.location.search);n.set(s,e),i.replace({...i.location,search:n.toString()})}),[s,i])]}function x(e){const{defaultValue:n,queryString:r=!1,groupId:i}=e,s=h(e),[l,a]=(0,t.useState)((()=>function(e){let{defaultValue:n,tabValues:r}=e;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!f({value:n,tabValues:r}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${r.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const t=r.find((e=>e.default))??r[0];if(!t)throw new Error("Unexpected error: 0 tabValues");return t.value}({defaultValue:n,tabValues:s}))),[u,d]=p({queryString:r,groupId:i}),[x,m]=function(e){let{groupId:n}=e;const r=function(e){return e?`docusaurus.tab.${e}`:null}(n),[i,s]=(0,o.Dv)(r);return[i,(0,t.useCallback)((e=>{r&&s.set(e)}),[r,s])]}({groupId:i}),y=(()=>{const e=u??x;return f({value:e,tabValues:s})?e:null})();(0,c.A)((()=>{y&&a(y)}),[y]);return{selectedValue:l,selectValue:(0,t.useCallback)((e=>{if(!f({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);a(e),d(e),m(e)}),[d,m,s]),tabValues:s}}var m=r(6681);const y={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var j=r(2540);function b(e){let{className:n,block:r,selectedValue:t,selectValue:l,tabValues:c}=e;const a=[],{blockElementScrollPositionUntilNextRender:u}=(0,s.a_)(),o=e=>{const n=e.currentTarget,r=a.indexOf(n),i=c[r].value;i!==t&&(u(n),l(i))},d=e=>{let n=null;switch(e.key){case"Enter":o(e);break;case"ArrowRight":{const r=a.indexOf(e.currentTarget)+1;n=a[r]??a[0];break}case"ArrowLeft":{const r=a.indexOf(e.currentTarget)-1;n=a[r]??a[a.length-1];break}}n?.focus()};return(0,j.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.A)("tabs",{"tabs--block":r},n),children:c.map((e=>{let{value:n,label:r,attributes:s}=e;return(0,j.jsx)("li",{role:"tab",tabIndex:t===n?0:-1,"aria-selected":t===n,ref:e=>a.push(e),onKeyDown:d,onClick:o,...s,className:(0,i.A)("tabs__item",y.tabItem,s?.className,{"tabs__item--active":t===n}),children:r??n},n)}))})}function q(e){let{lazy:n,children:r,selectedValue:i}=e;const s=(Array.isArray(r)?r:[r]).filter(Boolean);if(n){const e=s.find((e=>e.props.value===i));return e?(0,t.cloneElement)(e,{className:"margin-top--md"}):null}return(0,j.jsx)("div",{className:"margin-top--md",children:s.map(((e,n)=>(0,t.cloneElement)(e,{key:n,hidden:e.props.value!==i})))})}function g(e){const n=x(e);return(0,j.jsxs)("div",{className:(0,i.A)("tabs-container",y.tabList),children:[(0,j.jsx)(b,{...e,...n}),(0,j.jsx)(q,{...e,...n})]})}function v(e){const n=(0,m.A)();return(0,j.jsx)(g,{...e,children:d(e.children)},String(n))}},3023:(e,n,r)=>{r.d(n,{R:()=>l,x:()=>c});var t=r(3696);const i={},s=t.createContext(i);function l(e){const n=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),t.createElement(s.Provider,{value:n},e.children)}}}]);