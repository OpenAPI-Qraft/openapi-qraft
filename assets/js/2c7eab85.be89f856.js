"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[9706],{1208:(e,r,n)=>{n.d(r,{A:()=>l});n(3696);var t=n(2689);const i={tabItem:"tabItem_wHwb"};var s=n(2540);function l(e){let{children:r,hidden:n,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,t.A)(i.tabItem,l),hidden:n,children:r})}},9515:(e,r,n)=>{n.d(r,{A:()=>g});var t=n(3696),i=n(2689),s=n(3447),l=n(9519),a=n(6960),o=n(9624),u=n(6953),c=n(9866);function d(e){return t.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,t.isValidElement)(e)&&function(e){const{props:r}=e;return!!r&&"object"==typeof r&&"value"in r}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:r,children:n}=e;return(0,t.useMemo)((()=>{const e=r??function(e){return d(e).map((e=>{let{props:{value:r,label:n,attributes:t,default:i}}=e;return{value:r,label:n,attributes:t,default:i}}))}(n);return function(e){const r=(0,u.XI)(e,((e,r)=>e.value===r.value));if(r.length>0)throw new Error(`Docusaurus error: Duplicate values "${r.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[r,n])}function m(e){let{value:r,tabValues:n}=e;return n.some((e=>e.value===r))}function p(e){let{queryString:r=!1,groupId:n}=e;const i=(0,l.W6)(),s=function(e){let{queryString:r=!1,groupId:n}=e;if("string"==typeof r)return r;if(!1===r)return null;if(!0===r&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:r,groupId:n});return[(0,o.aZ)(s),(0,t.useCallback)((e=>{if(!s)return;const r=new URLSearchParams(i.location.search);r.set(s,e),i.replace({...i.location,search:r.toString()})}),[s,i])]}function f(e){const{defaultValue:r,queryString:n=!1,groupId:i}=e,s=h(e),[l,o]=(0,t.useState)((()=>function(e){let{defaultValue:r,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(r){if(!m({value:r,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${r}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return r}const t=n.find((e=>e.default))??n[0];if(!t)throw new Error("Unexpected error: 0 tabValues");return t.value}({defaultValue:r,tabValues:s}))),[u,d]=p({queryString:n,groupId:i}),[f,x]=function(e){let{groupId:r}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(r),[i,s]=(0,c.Dv)(n);return[i,(0,t.useCallback)((e=>{n&&s.set(e)}),[n,s])]}({groupId:i}),y=(()=>{const e=u??f;return m({value:e,tabValues:s})?e:null})();(0,a.A)((()=>{y&&o(y)}),[y]);return{selectedValue:l,selectValue:(0,t.useCallback)((e=>{if(!m({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);o(e),d(e),x(e)}),[d,x,s]),tabValues:s}}var x=n(9244);const y={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var v=n(2540);function b(e){let{className:r,block:n,selectedValue:t,selectValue:l,tabValues:a}=e;const o=[],{blockElementScrollPositionUntilNextRender:u}=(0,s.a_)(),c=e=>{const r=e.currentTarget,n=o.indexOf(r),i=a[n].value;i!==t&&(u(r),l(i))},d=e=>{let r=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":{const n=o.indexOf(e.currentTarget)+1;r=o[n]??o[0];break}case"ArrowLeft":{const n=o.indexOf(e.currentTarget)-1;r=o[n]??o[o.length-1];break}}r?.focus()};return(0,v.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.A)("tabs",{"tabs--block":n},r),children:a.map((e=>{let{value:r,label:n,attributes:s}=e;return(0,v.jsx)("li",{role:"tab",tabIndex:t===r?0:-1,"aria-selected":t===r,ref:e=>o.push(e),onKeyDown:d,onClick:c,...s,className:(0,i.A)("tabs__item",y.tabItem,s?.className,{"tabs__item--active":t===r}),children:n??r},r)}))})}function j(e){let{lazy:r,children:n,selectedValue:s}=e;const l=(Array.isArray(n)?n:[n]).filter(Boolean);if(r){const e=l.find((e=>e.props.value===s));return e?(0,t.cloneElement)(e,{className:(0,i.A)("margin-top--md",e.props.className)}):null}return(0,v.jsx)("div",{className:"margin-top--md",children:l.map(((e,r)=>(0,t.cloneElement)(e,{key:r,hidden:e.props.value!==s})))})}function q(e){const r=f(e);return(0,v.jsxs)("div",{className:(0,i.A)("tabs-container",y.tabList),children:[(0,v.jsx)(b,{...r,...e}),(0,v.jsx)(j,{...r,...e})]})}function g(e){const r=(0,x.A)();return(0,v.jsx)(q,{...e,children:d(e.children)},String(r))}},9280:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>c,contentTitle:()=>u,default:()=>m,frontMatter:()=>o,metadata:()=>t,toc:()=>d});const t=JSON.parse('{"id":"query-client/removeQueries","title":"removeQueries(...)","description":"The method can be used to remove queries. Refer to the TanStack","source":"@site/versioned_docs/version-1.x/query-client/removeQueries.mdx","sourceDirName":"query-client","slug":"/query-client/removeQueries","permalink":"/openapi-qraft/docs/query-client/removeQueries","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/versioned_docs/version-1.x/query-client/removeQueries.mdx","tags":[],"version":"1.x","frontMatter":{"sidebar_label":"removeQueries()"},"sidebar":"mainDocsSidebar","previous":{"title":"refetchQueries()","permalink":"/openapi-qraft/docs/query-client/refetchQueries"},"next":{"title":"resetQueries()","permalink":"/openapi-qraft/docs/query-client/resetQueries"}}');var i=n(2540),s=n(3023),l=n(9515),a=n(1208);const o={sidebar_label:"removeQueries()"},u="removeQueries(...)",c={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Examples",id:"examples",level:3}];function h(e){const r={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(r.header,{children:(0,i.jsx)(r.h1,{id:"removequeries",children:"removeQueries(...)"})}),"\n",(0,i.jsxs)(r.p,{children:["The method can be used to remove queries. Refer to the TanStack\n",(0,i.jsx)(r.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientremovequeries",children:(0,i.jsx)(r.em,{children:"queryClient.removeQueries \ud83c\udf34"})})," documentation."]}),"\n",(0,i.jsx)(r.pre,{children:(0,i.jsx)(r.code,{className:"language-ts",children:"qraft.<service>.<operation>.removeQueries(\n  filters,\n  queryClient,\n)\n"})}),"\n",(0,i.jsx)(r.h3,{id:"arguments",children:"Arguments"}),"\n",(0,i.jsxs)(r.ol,{children:["\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.code,{children:"filters: QueryFiltersByParameters | QueryFiltersByQueryKey"}),"\n",(0,i.jsxs)(r.ul,{children:["\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.strong,{children:"Required"}),", represents the ",(0,i.jsx)(r.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,i.jsx)(r.em,{children:"Query Filters \ud83c\udf34"})}),"\nto be used, strictly-typed \u2728"]}),"\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering queries by parameters"]}),"\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.code,{children:"filters.infinite: boolean"})," will be used to filter infinite or normal queries"]}),"\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.code,{children:"filters.queryKey: QueryKey"})," will be used for filtering queries by ",(0,i.jsx)(r.em,{children:"QueryKey"})," instead of parameters","\n",(0,i.jsxs)(r.ul,{children:["\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.code,{children:"filters.queryKey"})," and ",(0,i.jsx)(r.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.code,{children:"filters.predicate?: (query: Query) => boolean"})," will be used for filtering queries by custom predicate"]}),"\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.em,{children:"If not provided"}),"\n",(0,i.jsxs)(r.ul,{children:["\n",(0,i.jsx)(r.li,{children:"All queries for the specified endpoint will be removed"}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.code,{children:"queryClient: QueryClient"}),"\n",(0,i.jsxs)(r.ul,{children:["\n",(0,i.jsxs)(r.li,{children:[(0,i.jsx)(r.strong,{children:"Required"})," ",(0,i.jsx)(r.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,i.jsx)(r.em,{children:"QueryClient \ud83c\udf34"})})," to be used"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(r.h3,{id:"returns",children:"Returns"}),"\n",(0,i.jsxs)(r.p,{children:[(0,i.jsx)(r.code,{children:"void"}),": This method does not return anything"]}),"\n",(0,i.jsx)(r.h3,{id:"examples",children:"Examples"}),"\n",(0,i.jsxs)(l.A,{children:[(0,i.jsxs)(a.A,{value:"with-filters",label:(0,i.jsx)(r.span,{style:{verticalAlign:"middle"},children:(0,i.jsx)(r.code,{children:"filters"})}),children:[(0,i.jsx)(r.p,{children:"Queries removal with the specified parameters:"}),(0,i.jsx)(r.pre,{children:(0,i.jsx)(r.code,{className:"language-ts",children:"/**\n * Removes the active queries with the specified parameters:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n **/\nqraft.entities.getEntities.removeQueries(\n  {\n    infinite: false,\n    parameters: {\n      header: {\n        'x-monite-version': '2023-09-01',\n      },\n      path: {\n        entity_id: '3e3e-3e3e-3e3e',\n      },\n    },\n  },\n  queryClient\n);\n"})})]}),(0,i.jsxs)(a.A,{value:"without-filters",label:(0,i.jsx)(r.span,{style:{verticalAlign:"middle"},children:(0,i.jsx)(r.code,{style:{textDecoration:"line-through"},children:"filters"})}),children:[(0,i.jsxs)(r.p,{children:["To remove ",(0,i.jsx)(r.em,{children:"all queries for a particular endpoint"}),", you can call ",(0,i.jsx)(r.code,{children:"removeQueries(...)"})," without ",(0,i.jsx)(r.code,{children:"parameters"}),":"]}),(0,i.jsx)(r.pre,{children:(0,i.jsx)(r.code,{className:"language-ts",children:"/**\n * Removes queries matching the specified endpoint:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n * ###\n * GET /entities/4c4c-4c4c-4c4c\n * x-monite-version: 2023-09-01\n * ###\n * \u2b07\ufe0e All queries for the specified endpoint will be removed\n **/\nqraft.entities.getEntities.removeQueries(queryClient);\n"})})]}),(0,i.jsxs)(a.A,{value:"with-predicate",label:(0,i.jsx)(r.span,{style:{verticalAlign:"middle"},children:(0,i.jsx)(r.code,{children:"predicate"})}),children:[(0,i.jsxs)(r.p,{children:["Removes queries with a custom ",(0,i.jsx)(r.code,{children:"predicate(...)"})," function,\nwhich will be used as a final filter on all matching queries.\nSee ",(0,i.jsx)(r.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,i.jsx)(r.em,{children:"Query Filters \ud83c\udf34"})}),"\nfor more information."]}),(0,i.jsx)(r.pre,{children:(0,i.jsx)(r.code,{className:"language-ts",children:"/**\n * Will remove queries matching the specified endpoint and predicate:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n **/\nqraft.entities.getEntities.removeQueries(\n  {\n    infinite: false,\n    parameters, // * optional, or specific parameters, alternatively, you can use `queryKey`\n    predicate: (query) => {\n      // `queryKey`\u2b07\ufe0e is fully typed to `qraft.entities.getEntities` operation parameters\n      if (query.queryKey[1].path.entity_id === '4c4c-4c4c-4c4c') return false;\n\n      return true;\n    },\n  },\n  queryClient\n);\n"})})]}),(0,i.jsxs)(a.A,{value:"with-query-key",label:(0,i.jsx)(r.span,{style:{verticalAlign:"middle"},children:(0,i.jsx)(r.code,{children:"queryKey"})}),children:[(0,i.jsxs)(r.p,{children:["It could be useful to remove queries using ",(0,i.jsx)(r.code,{children:"queryKey"})," directly:"]}),(0,i.jsx)(r.pre,{children:(0,i.jsx)(r.code,{className:"language-ts",children:"/**\n * Removes queries matching the specified endpoint:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n **/\nqraft.entities.getEntities.removeQueries(\n  {\n    // `queryKey` is fully typed to `qraft.entities.getEntities`\n    queryKey: qraft.entities.getEntities.getQueryKey({\n      header: {\n        'x-monite-version': '2023-09-01',\n      },\n      path: {\n        entity_id: '3e3e-3e3e-3e3e',\n      },\n    }),\n  },\n  queryClient\n);\n"})})]})]})]})}function m(e={}){const{wrapper:r}={...(0,s.R)(),...e.components};return r?(0,i.jsx)(r,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},3023:(e,r,n)=>{n.d(r,{R:()=>l,x:()=>a});var t=n(3696);const i={},s=t.createContext(i);function l(e){const r=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function a(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),t.createElement(s.Provider,{value:r},e.children)}}}]);