"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[2488],{1208:(e,t,n)=>{n.d(t,{A:()=>l});n(3696);var a=n(2689);const r={tabItem:"tabItem_wHwb"};var s=n(2540);function l(e){let{children:t,hidden:n,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,a.A)(r.tabItem,l),hidden:n,children:t})}},9515:(e,t,n)=>{n.d(t,{A:()=>q});var a=n(3696),r=n(2689),s=n(3447),l=n(9519),i=n(6960),o=n(9624),u=n(6953),c=n(9866);function d(e){return a.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,a.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:t,children:n}=e;return(0,a.useMemo)((()=>{const e=t??function(e){return d(e).map((e=>{let{props:{value:t,label:n,attributes:a,default:r}}=e;return{value:t,label:n,attributes:a,default:r}}))}(n);return function(e){const t=(0,u.XI)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function p(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function f(e){let{queryString:t=!1,groupId:n}=e;const r=(0,l.W6)(),s=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,o.aZ)(s),(0,a.useCallback)((e=>{if(!s)return;const t=new URLSearchParams(r.location.search);t.set(s,e),r.replace({...r.location,search:t.toString()})}),[s,r])]}function m(e){const{defaultValue:t,queryString:n=!1,groupId:r}=e,s=h(e),[l,o]=(0,a.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!p({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const a=n.find((e=>e.default))??n[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:t,tabValues:s}))),[u,d]=f({queryString:n,groupId:r}),[m,x]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[r,s]=(0,c.Dv)(n);return[r,(0,a.useCallback)((e=>{n&&s.set(e)}),[n,s])]}({groupId:r}),y=(()=>{const e=u??m;return p({value:e,tabValues:s})?e:null})();(0,i.A)((()=>{y&&o(y)}),[y]);return{selectedValue:l,selectValue:(0,a.useCallback)((e=>{if(!p({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);o(e),d(e),x(e)}),[d,x,s]),tabValues:s}}var x=n(9244);const y={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var b=n(2540);function j(e){let{className:t,block:n,selectedValue:a,selectValue:l,tabValues:i}=e;const o=[],{blockElementScrollPositionUntilNextRender:u}=(0,s.a_)(),c=e=>{const t=e.currentTarget,n=o.indexOf(t),r=i[n].value;r!==a&&(u(t),l(r))},d=e=>{let t=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":{const n=o.indexOf(e.currentTarget)+1;t=o[n]??o[0];break}case"ArrowLeft":{const n=o.indexOf(e.currentTarget)-1;t=o[n]??o[o.length-1];break}}t?.focus()};return(0,b.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,r.A)("tabs",{"tabs--block":n},t),children:i.map((e=>{let{value:t,label:n,attributes:s}=e;return(0,b.jsx)("li",{role:"tab",tabIndex:a===t?0:-1,"aria-selected":a===t,ref:e=>o.push(e),onKeyDown:d,onClick:c,...s,className:(0,r.A)("tabs__item",y.tabItem,s?.className,{"tabs__item--active":a===t}),children:n??t},t)}))})}function v(e){let{lazy:t,children:n,selectedValue:s}=e;const l=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=l.find((e=>e.props.value===s));return e?(0,a.cloneElement)(e,{className:(0,r.A)("margin-top--md",e.props.className)}):null}return(0,b.jsx)("div",{className:"margin-top--md",children:l.map(((e,t)=>(0,a.cloneElement)(e,{key:t,hidden:e.props.value!==s})))})}function g(e){const t=m(e);return(0,b.jsxs)("div",{className:(0,r.A)("tabs-container",y.tabList),children:[(0,b.jsx)(j,{...t,...e}),(0,b.jsx)(v,{...t,...e})]})}function q(e){const t=(0,x.A)();return(0,b.jsx)(g,{...e,children:d(e.children)},String(t))}},9526:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>u,default:()=>p,frontMatter:()=>o,metadata:()=>a,toc:()=>d});const a=JSON.parse('{"id":"query-client/setQueryData","title":"setQueryData(...)","description":"The method enables direct access to the QueryClient cache to set the data for a specific Query.","source":"@site/docs/query-client/setQueryData.mdx","sourceDirName":"query-client","slug":"/query-client/setQueryData","permalink":"/openapi-qraft/docs/next/query-client/setQueryData","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/query-client/setQueryData.mdx","tags":[],"version":"current","frontMatter":{"sidebar_label":"setQueryData()"},"sidebar":"mainDocsSidebar","previous":{"title":"setQueriesData()","permalink":"/openapi-qraft/docs/next/query-client/setQueriesData"},"next":{"title":"Migrating to v2","permalink":"/openapi-qraft/docs/next/migrating-to-openapi-qraft-v2"}}');var r=n(2540),s=n(3023),l=n(9515),i=n(1208);const o={sidebar_label:"setQueryData()"},u="setQueryData(...)",c={},d=[{value:"Arguments",id:"arguments",level:2},{value:"Returns",id:"returns",level:2},{value:"Example",id:"example",level:2}];function h(e){const t={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.header,{children:(0,r.jsx)(t.h1,{id:"setquerydata",children:"setQueryData(...)"})}),"\n",(0,r.jsxs)(t.p,{children:["The method enables direct access to the ",(0,r.jsx)(t.code,{children:"QueryClient"})," cache to set the data for a specific ",(0,r.jsx)(t.em,{children:"Query"}),".\nSee the TanStack ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientsetquerydata",children:(0,r.jsx)(t.em,{children:"queryClient.setQueryData \ud83c\udf34"})})," documentation."]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-ts",children:"const data = qraft.<service>.<operation>.setQueryData(\n  parameters,\n  updater,\n  options\n);\n"})}),"\n",(0,r.jsx)(t.h2,{id:"arguments",children:"Arguments"}),"\n",(0,r.jsxs)(t.ol,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"parameters: { path, query, header } | QueryKey"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Required"})," parameters to set the data in the ",(0,r.jsx)(t.em,{children:"Query Cache"}),"."]}),"\n",(0,r.jsxs)(t.li,{children:["Instead of an object with ",(0,r.jsx)(t.code,{children:"{path, query, header}"}),", you can pass a ",(0,r.jsx)(t.code,{children:"QueryKey"})," as an array\nwhich is also strictly-typed \u2728"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"updater: TData | (oldData: TData | undefined) => TData | undefined"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Required"})," updater for the cache data"]}),"\n",(0,r.jsx)(t.li,{children:"If a non-function value is passed, the data will be updated to this value"}),"\n",(0,r.jsx)(t.li,{children:"If a function is passed, it will receive the old data value and is expected to return a new one"}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"options?: SetQueryDataOptions"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Optional"})," options to set the data in the cache"]}),"\n",(0,r.jsxs)(t.li,{children:["See the TanStack ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientsetquerydata",children:(0,r.jsx)(t.em,{children:"queryClient.setQueryData \ud83c\udf34"})}),"\ndocumentation for more details"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(t.h2,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(t.p,{children:["The ",(0,r.jsx)(t.code,{children:"TData"})," from the updater or ",(0,r.jsx)(t.code,{children:"undefined"})," if it returns nothing"]}),"\n",(0,r.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,r.jsxs)(l.A,{children:[(0,r.jsx)(i.A,{value:"without-options",label:(0,r.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["Without ",(0,r.jsx)(t.code,{children:"options"})]}),children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",children:"const parameters = { path: { petId: 123 } };\n\nqraft.pet.getPetById.setQueryData(\n  parameters,\n  { id: 123, name: 'Rex' }\n);\n\nconst pet = qraft.pet.getPetById.getQueryData(parameters);\n\nexpect(pet).toEqual({\n  id: 123,\n  name: 'Rex',\n});\n"})})}),(0,r.jsxs)(i.A,{value:"with-query-key",label:(0,r.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["With ",(0,r.jsx)(t.code,{children:"QueryKey"})]}),children:[(0,r.jsxs)(t.p,{children:["It's also possible to use a ",(0,r.jsx)(t.code,{children:"QueryKey"})," as an array instead of an object with ",(0,r.jsx)(t.code,{children:"{path, query, header}"}),":"]}),(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",children:"const pet = qraft.pet.getPetById.setQueryData(\n  [\n    { method: 'get', url: '/pet/{petId}', infinite: false },\n    { petId: 123 },\n  ],\n  { id: 123, name: 'Rex' }\n);\n"})})]}),(0,r.jsx)(i.A,{value:"with-options",label:(0,r.jsxs)(t.span,{style:{verticalAlign:"middle"},children:["With ",(0,r.jsx)(t.code,{children:"options"})]}),children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",children:"const pet = qraft.pet.getPetById.setQueryData(\n  { path: { petId: 123 } },\n  { id: 123, name: 'Rex' },\n  { updatedAt: Date.now() - 60_000 }\n);\n"})})})]})]})}function p(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},3023:(e,t,n)=>{n.d(t,{R:()=>l,x:()=>i});var a=n(3696);const r={},s=a.createContext(r);function l(e){const t=a.useContext(s);return a.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),a.createElement(s.Provider,{value:t},e.children)}}}]);