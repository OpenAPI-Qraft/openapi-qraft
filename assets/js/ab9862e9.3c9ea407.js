"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[6055],{1208:(e,t,r)=>{r.d(t,{A:()=>l});r(3696);var n=r(2689);const a={tabItem:"tabItem_wHwb"};var s=r(2540);function l(e){let{children:t,hidden:r,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,n.A)(a.tabItem,l),hidden:r,children:t})}},9515:(e,t,r)=>{r.d(t,{A:()=>q});var n=r(3696),a=r(2689),s=r(3447),l=r(9519),u=r(6960),i=r(9624),o=r(6953),c=r(9866);function d(e){return n.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,n.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:t,children:r}=e;return(0,n.useMemo)((()=>{const e=t??function(e){return d(e).map((e=>{let{props:{value:t,label:r,attributes:n,default:a}}=e;return{value:t,label:r,attributes:n,default:a}}))}(r);return function(e){const t=(0,o.XI)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,r])}function p(e){let{value:t,tabValues:r}=e;return r.some((e=>e.value===t))}function f(e){let{queryString:t=!1,groupId:r}=e;const a=(0,l.W6)(),s=function(e){let{queryString:t=!1,groupId:r}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!r)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return r??null}({queryString:t,groupId:r});return[(0,i.aZ)(s),(0,n.useCallback)((e=>{if(!s)return;const t=new URLSearchParams(a.location.search);t.set(s,e),a.replace({...a.location,search:t.toString()})}),[s,a])]}function m(e){const{defaultValue:t,queryString:r=!1,groupId:a}=e,s=h(e),[l,i]=(0,n.useState)((()=>function(e){let{defaultValue:t,tabValues:r}=e;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!p({value:t,tabValues:r}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${r.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const n=r.find((e=>e.default))??r[0];if(!n)throw new Error("Unexpected error: 0 tabValues");return n.value}({defaultValue:t,tabValues:s}))),[o,d]=f({queryString:r,groupId:a}),[m,y]=function(e){let{groupId:t}=e;const r=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,s]=(0,c.Dv)(r);return[a,(0,n.useCallback)((e=>{r&&s.set(e)}),[r,s])]}({groupId:a}),b=(()=>{const e=o??m;return p({value:e,tabValues:s})?e:null})();(0,u.A)((()=>{b&&i(b)}),[b]);return{selectedValue:l,selectValue:(0,n.useCallback)((e=>{if(!p({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);i(e),d(e),y(e)}),[d,y,s]),tabValues:s}}var y=r(9244);const b={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var x=r(2540);function g(e){let{className:t,block:r,selectedValue:n,selectValue:l,tabValues:u}=e;const i=[],{blockElementScrollPositionUntilNextRender:o}=(0,s.a_)(),c=e=>{const t=e.currentTarget,r=i.indexOf(t),a=u[r].value;a!==n&&(o(t),l(a))},d=e=>{let t=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":{const r=i.indexOf(e.currentTarget)+1;t=i[r]??i[0];break}case"ArrowLeft":{const r=i.indexOf(e.currentTarget)-1;t=i[r]??i[i.length-1];break}}t?.focus()};return(0,x.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":r},t),children:u.map((e=>{let{value:t,label:r,attributes:s}=e;return(0,x.jsx)("li",{role:"tab",tabIndex:n===t?0:-1,"aria-selected":n===t,ref:e=>i.push(e),onKeyDown:d,onClick:c,...s,className:(0,a.A)("tabs__item",b.tabItem,s?.className,{"tabs__item--active":n===t}),children:r??t},t)}))})}function v(e){let{lazy:t,children:r,selectedValue:s}=e;const l=(Array.isArray(r)?r:[r]).filter(Boolean);if(t){const e=l.find((e=>e.props.value===s));return e?(0,n.cloneElement)(e,{className:(0,a.A)("margin-top--md",e.props.className)}):null}return(0,x.jsx)("div",{className:"margin-top--md",children:l.map(((e,t)=>(0,n.cloneElement)(e,{key:t,hidden:e.props.value!==s})))})}function j(e){const t=m(e);return(0,x.jsxs)("div",{className:(0,a.A)("tabs-container",b.tabList),children:[(0,x.jsx)(g,{...t,...e}),(0,x.jsx)(v,{...t,...e})]})}function q(e){const t=(0,y.A)();return(0,x.jsx)(j,{...e,children:d(e.children)},String(t))}},8328:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>p,frontMatter:()=>i,metadata:()=>n,toc:()=>d});const n=JSON.parse('{"id":"query-client/getQueryData","title":"getQueryData(...)","description":"The method enables direct access to the QueryClient cache to retrieve the data for a specific Query.","source":"@site/versioned_docs/version-1.x/query-client/getQueryData.mdx","sourceDirName":"query-client","slug":"/query-client/getQueryData","permalink":"/openapi-qraft/docs/query-client/getQueryData","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/versioned_docs/version-1.x/query-client/getQueryData.mdx","tags":[],"version":"1.x","frontMatter":{"sidebar_label":"getQueryData()"},"sidebar":"mainDocsSidebar","previous":{"title":"getQueriesData()","permalink":"/openapi-qraft/docs/query-client/getQueriesData"},"next":{"title":"getQueryKey()","permalink":"/openapi-qraft/docs/query-client/getQueryKey"}}');var a=r(2540),s=r(3023),l=r(9515),u=r(1208);const i={sidebar_label:"getQueryData()"},o="getQueryData(...)",c={},d=[{value:"Arguments",id:"arguments",level:2},{value:"Returns",id:"returns",level:2},{value:"Example",id:"example",level:2}];function h(e){const t={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.header,{children:(0,a.jsx)(t.h1,{id:"getquerydata",children:"getQueryData(...)"})}),"\n",(0,a.jsxs)(t.p,{children:["The method enables direct access to the ",(0,a.jsx)(t.code,{children:"QueryClient"})," cache to retrieve the data for a specific ",(0,a.jsx)(t.em,{children:"Query"}),".\nSee the TanStack ",(0,a.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientgetquerydata",children:(0,a.jsx)(t.em,{children:"queryClient.getQueryData \ud83c\udf34"})})," documentation."]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-ts",children:"const data = qraft.<service>.<operation>.getQueryData(\n  parameters,\n  queryClient\n);\n"})}),"\n",(0,a.jsx)(t.h2,{id:"arguments",children:"Arguments"}),"\n",(0,a.jsxs)(t.ol,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"parameters: { path, query, header } | QueryKey"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Required"})," parameters to retrieve the data from the ",(0,a.jsx)(t.em,{children:"Query Cache"}),"."]}),"\n",(0,a.jsxs)(t.li,{children:["Instead of an object with ",(0,a.jsx)(t.code,{children:"{path, query, header}"}),", you can pass a ",(0,a.jsx)(t.code,{children:"QueryKey"})," as an array\nwhich is also strictly-typed \u2728"]}),"\n"]}),"\n"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"queryClient: QueryClient"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Required"})," ",(0,a.jsx)(t.code,{children:"QueryClient"})," instance to use"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,a.jsx)(t.h2,{id:"returns",children:"Returns"}),"\n",(0,a.jsxs)(t.p,{children:["The data from the ",(0,a.jsx)(t.em,{children:"Query Cache"})," for the specific query, strictly-typed \u2728"]}),"\n",(0,a.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,a.jsxs)(l.A,{children:[(0,a.jsx)(u.A,{value:"parameters",label:"Parameters",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-tsx",children:"const pet = qraft.pet.getPetById.getQueryData(\n  {\n    path: { petId: 123 },\n  },\n  queryClient\n);\n\nexpect(pet?.id).toEqual(123);\n"})})}),(0,a.jsx)(u.A,{value:"query-key",label:"QueryKey",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-tsx",children:"const pet = qraft.pet.getPetById.getQueryData(\n  [\n    { method: 'get', url: '/pet/{petId}' },\n    { petId: 123 },\n  ],\n  queryClient\n);\n\nexpect(pet?.id).toEqual(123);\n"})})})]})]})}function p(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(h,{...e})}):h(e)}},3023:(e,t,r)=>{r.d(t,{R:()=>l,x:()=>u});var n=r(3696);const a={},s=n.createContext(a);function l(e){const t=n.useContext(s);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function u(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:l(e.components),n.createElement(s.Provider,{value:t},e.children)}}}]);