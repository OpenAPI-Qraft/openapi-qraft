"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[8087],{9393:(e,n,t)=>{t.d(n,{A:()=>l});t(3696);var r=t(1750);const i={tabItem:"tabItem_wHwb"};var s=t(2540);function l(e){let{children:n,hidden:t,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,r.A)(i.tabItem,l),hidden:t,children:n})}},9942:(e,n,t)=>{t.d(n,{A:()=>q});var r=t(3696),i=t(1750),s=t(5162),l=t(9519),a=t(5367),c=t(271),u=t(5476),o=t(5095);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:i}}=e;return{value:n,label:t,attributes:r,default:i}}))}(t);return function(e){const n=(0,u.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function f(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function p(e){let{queryString:n=!1,groupId:t}=e;const i=(0,l.W6)(),s=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,c.aZ)(s),(0,r.useCallback)((e=>{if(!s)return;const n=new URLSearchParams(i.location.search);n.set(s,e),i.replace({...i.location,search:n.toString()})}),[s,i])]}function m(e){const{defaultValue:n,queryString:t=!1,groupId:i}=e,s=h(e),[l,c]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!f({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:s}))),[u,d]=p({queryString:t,groupId:i}),[m,x]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[i,s]=(0,o.Dv)(t);return[i,(0,r.useCallback)((e=>{t&&s.set(e)}),[t,s])]}({groupId:i}),b=(()=>{const e=u??m;return f({value:e,tabValues:s})?e:null})();(0,a.A)((()=>{b&&c(b)}),[b]);return{selectedValue:l,selectValue:(0,r.useCallback)((e=>{if(!f({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);c(e),d(e),x(e)}),[d,x,s]),tabValues:s}}var x=t(1173);const b={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var g=t(2540);function j(e){let{className:n,block:t,selectedValue:r,selectValue:l,tabValues:a}=e;const c=[],{blockElementScrollPositionUntilNextRender:u}=(0,s.a_)(),o=e=>{const n=e.currentTarget,t=c.indexOf(n),i=a[t].value;i!==r&&(u(n),l(i))},d=e=>{let n=null;switch(e.key){case"Enter":o(e);break;case"ArrowRight":{const t=c.indexOf(e.currentTarget)+1;n=c[t]??c[0];break}case"ArrowLeft":{const t=c.indexOf(e.currentTarget)-1;n=c[t]??c[c.length-1];break}}n?.focus()};return(0,g.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.A)("tabs",{"tabs--block":t},n),children:a.map((e=>{let{value:n,label:t,attributes:s}=e;return(0,g.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>c.push(e),onKeyDown:d,onClick:o,...s,className:(0,i.A)("tabs__item",b.tabItem,s?.className,{"tabs__item--active":r===n}),children:t??n},n)}))})}function y(e){let{lazy:n,children:t,selectedValue:s}=e;const l=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=l.find((e=>e.props.value===s));return e?(0,r.cloneElement)(e,{className:(0,i.A)("margin-top--md",e.props.className)}):null}return(0,g.jsx)("div",{className:"margin-top--md",children:l.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==s})))})}function v(e){const n=m(e);return(0,g.jsxs)("div",{className:(0,i.A)("tabs-container",b.tabList),children:[(0,g.jsx)(j,{...n,...e}),(0,g.jsx)(y,{...n,...e})]})}function q(e){const n=(0,x.A)();return(0,g.jsx)(v,{...e,children:d(e.children)},String(n))}},4076:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>c,default:()=>f,frontMatter:()=>a,metadata:()=>u,toc:()=>d});var r=t(2540),i=t(3023),s=t(9942),l=t(9393);const a={sidebar_label:"isFetching()"},c="isFetching(...)",u={id:"query-client/isFetching",title:"isFetching(...)",description:"This method returns an integer representing how many queries, if any, in the cache are currently fetching.",source:"@site/docs/query-client/isFetching.mdx",sourceDirName:"query-client",slug:"/query-client/isFetching",permalink:"/openapi-qraft/docs/next/query-client/isFetching",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/query-client/isFetching.mdx",tags:[],version:"current",frontMatter:{sidebar_label:"isFetching()"},sidebar:"mainDocsSidebar",previous:{title:"invalidateQueries()",permalink:"/openapi-qraft/docs/next/query-client/invalidateQueries"},next:{title:"isMutating()",permalink:"/openapi-qraft/docs/next/query-client/isMutating"}},o={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Examples",id:"examples",level:3}];function h(e){const n={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"isfetching",children:"isFetching(...)"})}),"\n",(0,r.jsxs)(n.p,{children:["This method returns an integer representing how many queries, if any, in the cache are currently fetching.\nRefer to the TanStack ",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientisfetching",children:(0,r.jsx)(n.em,{children:"queryClient.isFetching \ud83c\udf34"})}),"\nguide for more information."]}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsxs)(l.A,{value:"with-filters",label:(0,r.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["With ",(0,r.jsx)(n.code,{children:"filters"})]}),children:[(0,r.jsx)(n.p,{children:"Checks if any queries are fetching with the specified parameters."}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"qraft.<service>.<operation>.isFetching(\n  filters\n)\n"})}),(0,r.jsx)(n.h3,{id:"arguments",children:"Arguments"}),(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"filters: QueryFiltersByParameters | QueryFiltersByQueryKey"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Required"}),", represents the ",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,r.jsx)(n.em,{children:"Query Filters \ud83c\udf34"})}),"\nto be used, strictly-typed \u2728"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering queries by parameters"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"filters.infinite: boolean"})," will be used to filter infinite or normal queries"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"filters.queryKey: QueryKey"})," will be used for filtering queries by ",(0,r.jsx)(n.em,{children:"QueryKey"})," instead of parameters","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"filters.queryKey"})," and ",(0,r.jsx)(n.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"filters.predicate?: (query: Query) => boolean"})," will be used for filtering queries by custom predicate"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.em,{children:"If not provided"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"All queries for the specified endpoint will be checked"}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]})]}),(0,r.jsxs)(l.A,{value:"without-filters",label:(0,r.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["Without ",(0,r.jsx)(n.code,{children:"filters"})]}),children:[(0,r.jsxs)(n.p,{children:["Check ",(0,r.jsx)(n.em,{children:"all"})," normal and ",(0,r.jsx)(n.em,{children:"Infinite"})," queries for the specified endpoint."]}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"qraft.<service>.<operation>.isFetching()\n"})})]})]}),"\n",(0,r.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"number"}),": Number of queries fetching."]}),"\n",(0,r.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsxs)(l.A,{value:"with-filters",label:(0,r.jsx)(n.span,{style:{verticalAlign:"middle"},children:(0,r.jsx)(n.code,{children:"filters"})}),children:[(0,r.jsx)(n.p,{children:"Check if any queries are fetching with the specified parameters:"}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"/**\n* Will check if the query with the specified parameters is fetching:\n* ###\n* GET /entities/3e3e-3e3e-3e3e\n* x-monite-version: 2023-09-01\n**/\nconst numberOfFetchingEntities = qraft.entities.getEntities.isFetching(\n  {\n    infinite: false,\n    parameters: {\n      header: {\n        'x-monite-version': '2023-09-01',\n      },\n      path: {\n        entity_id: '3e3e-3e3e-3e3e',\n      },\n    },\n  }\n);\n\nexpect(numberOfFetchingEntities).toEqual(1);\n"})})]}),(0,r.jsxs)(l.A,{value:"without-filters",label:(0,r.jsx)(n.span,{style:{verticalAlign:"middle"},children:(0,r.jsx)(n.code,{style:{textDecoration:"line-through"},children:"filters"})}),children:[(0,r.jsxs)(n.p,{children:["To check ",(0,r.jsx)(n.em,{children:"all normal queries for a particular endpoint"}),", you can call ",(0,r.jsx)(n.code,{children:"isFetching(...)"})," without ",(0,r.jsx)(n.code,{children:"parameters"}),":"]}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"/**\n * Will check queries matching the specified endpoint:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n * ###\n * GET /entities/4c4c-4c4c-4c4c\n * x-monite-version: 2023-09-01\n * ###\n * \u2b07\ufe0e All queries for the specified endpoint will be used\n **/\nconst numberOfFetchingEntities = qraft.entities.getEntities.isFetching();\n\nexpect(numberOfFetchingEntities).toEqual(2);\n"})})]})]})]})}function f(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>l,x:()=>a});var r=t(3696);const i={},s=r.createContext(i);function l(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);