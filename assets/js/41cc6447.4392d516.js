"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[745],{1208:(e,n,t)=>{t.d(n,{A:()=>l});t(3696);var r=t(2689);const s={tabItem:"tabItem_wHwb"};var a=t(2540);function l(e){let{children:n,hidden:t,className:l}=e;return(0,a.jsx)("div",{role:"tabpanel",className:(0,r.A)(s.tabItem,l),hidden:t,children:n})}},9515:(e,n,t)=>{t.d(n,{A:()=>y});var r=t(3696),s=t(2689),a=t(3447),l=t(9519),i=t(6960),o=t(9624),u=t(6953),c=t(9866);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:s}}=e;return{value:n,label:t,attributes:r,default:s}}))}(t);return function(e){const n=(0,u.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function p(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function m(e){let{queryString:n=!1,groupId:t}=e;const s=(0,l.W6)(),a=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,o.aZ)(a),(0,r.useCallback)((e=>{if(!a)return;const n=new URLSearchParams(s.location.search);n.set(a,e),s.replace({...s.location,search:n.toString()})}),[a,s])]}function x(e){const{defaultValue:n,queryString:t=!1,groupId:s}=e,a=h(e),[l,o]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!p({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:a}))),[u,d]=m({queryString:t,groupId:s}),[x,f]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[s,a]=(0,c.Dv)(t);return[s,(0,r.useCallback)((e=>{t&&a.set(e)}),[t,a])]}({groupId:s}),b=(()=>{const e=u??x;return p({value:e,tabValues:a})?e:null})();(0,i.A)((()=>{b&&o(b)}),[b]);return{selectedValue:l,selectValue:(0,r.useCallback)((e=>{if(!p({value:e,tabValues:a}))throw new Error(`Can't select invalid tab value=${e}`);o(e),d(e),f(e)}),[d,f,a]),tabValues:a}}var f=t(9244);const b={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var j=t(2540);function v(e){let{className:n,block:t,selectedValue:r,selectValue:l,tabValues:i}=e;const o=[],{blockElementScrollPositionUntilNextRender:u}=(0,a.a_)(),c=e=>{const n=e.currentTarget,t=o.indexOf(n),s=i[t].value;s!==r&&(u(n),l(s))},d=e=>{let n=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":{const t=o.indexOf(e.currentTarget)+1;n=o[t]??o[0];break}case"ArrowLeft":{const t=o.indexOf(e.currentTarget)-1;n=o[t]??o[o.length-1];break}}n?.focus()};return(0,j.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.A)("tabs",{"tabs--block":t},n),children:i.map((e=>{let{value:n,label:t,attributes:a}=e;return(0,j.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>o.push(e),onKeyDown:d,onClick:c,...a,className:(0,s.A)("tabs__item",b.tabItem,a?.className,{"tabs__item--active":r===n}),children:t??n},n)}))})}function q(e){let{lazy:n,children:t,selectedValue:a}=e;const l=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=l.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:(0,s.A)("margin-top--md",e.props.className)}):null}return(0,j.jsx)("div",{className:"margin-top--md",children:l.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==a})))})}function g(e){const n=x(e);return(0,j.jsxs)("div",{className:(0,s.A)("tabs-container",b.tabList),children:[(0,j.jsx)(v,{...n,...e}),(0,j.jsx)(q,{...n,...e})]})}function y(e){const n=(0,f.A)();return(0,j.jsx)(g,{...e,children:d(e.children)},String(n))}},9435:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>u,default:()=>p,frontMatter:()=>o,metadata:()=>r,toc:()=>d});const r=JSON.parse('{"id":"core/mutation-operation","title":"POST, PUT, PATCH, DELETE","description":"The method allows you to execute a Mutations without TanStack\'s QueryClient.","source":"@site/versioned_docs/version-1.x/core/mutation-operation.mdx","sourceDirName":"core","slug":"/core/mutation-operation","permalink":"/openapi-qraft/docs/core/mutation-operation","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/versioned_docs/version-1.x/core/mutation-operation.mdx","tags":[],"version":"1.x","sidebarPosition":20,"frontMatter":{"sidebar_label":"POST, PUT, PATCH, DELETE","sidebar_position":20},"sidebar":"mainDocsSidebar","previous":{"title":"GET, HEAD, OPTIONS","permalink":"/openapi-qraft/docs/core/query-operation"},"next":{"title":"requestFn()","permalink":"/openapi-qraft/docs/core/requestFn"}}');var s=t(2540),a=t(3023),l=t(9515),i=t(1208);const o={sidebar_label:"POST, PUT, PATCH, DELETE",sidebar_position:20},u="POST, PUT, PATCH, DELETE",c={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Arguments",id:"arguments-1",level:3},{value:"Returns",id:"returns",level:3},{value:"Examples",id:"examples",level:3}];function h(e){const n={code:"code",del:"del",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,a.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"post-put-patch-delete",children:"POST, PUT, PATCH, DELETE"})}),"\n",(0,s.jsxs)(n.p,{children:["The method allows you to execute a ",(0,s.jsx)(n.em,{children:"Mutations"})," without TanStack's ",(0,s.jsx)(n.del,{children:(0,s.jsx)(n.em,{children:"QueryClient"})}),"."]}),"\n",(0,s.jsxs)(l.A,{children:[(0,s.jsxs)(i.A,{value:"with-base-url",label:(0,s.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["With ",(0,s.jsx)(n.code,{children:"baseUrl"})]}),default:!0,children:[(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"import { requestFn } from '@openapi-qraft/react';\n\nconst result = qraft.<service>.<operation>(\n  {\n    parameters,\n    baseUrl,\n    signal,\n    meta,\n  },\n  requestFn\n);\n"})}),(0,s.jsx)(n.h3,{id:"arguments",children:"Arguments"}),(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"parameters: { path, query, header } | {}"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Required"}),", OpenAPI request parameters for the query, strictly-typed \u2728"]}),"\n",(0,s.jsxs)(n.li,{children:["If operation does not require parameters, you must pass an empty object ",(0,s.jsx)(n.code,{children:"{}"})," for strictness"]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"baseUrl"})," - ",(0,s.jsx)(n.strong,{children:"Required"})," base URL for the ",(0,s.jsx)(n.code,{children:"requestFn"})]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"requestFn: RequestFn"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Required"}),", a function that will be used to execute the request"]}),"\n"]}),"\n"]}),"\n"]})]}),(0,s.jsxs)(i.A,{value:"no-base-url",label:(0,s.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["No ",(0,s.jsx)(n.code,{style:{textDecoration:"line-through"},children:"baseUrl"})]}),default:!0,children:[(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"const result = qraft.<service>.<operation>(\n  {\n    parameters,\n    signal,\n    meta,\n  },\n  requestFn\n);\n"})}),(0,s.jsx)(n.h3,{id:"arguments-1",children:"Arguments"}),(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"parameters: { path, query, header } | {}"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Required"}),", OpenAPI request parameters for the query, strictly-typed \u2728"]}),"\n",(0,s.jsxs)(n.li,{children:["If operation does not require parameters, you must pass an empty object ",(0,s.jsx)(n.code,{children:"{}"})," for strictness"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"requestFn: Omit<RequestFn, 'baseUrl'>"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Required"}),", a function that will be used to execute the request. Note,\nthat ",(0,s.jsx)(n.code,{children:"baseUrl"})," will not be provided in the ",(0,s.jsx)(n.code,{children:"requestFn"}),"."]}),"\n"]}),"\n"]}),"\n"]})]})]}),"\n",(0,s.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"result: Promise<T>"})," - The result of the query execution"]}),"\n",(0,s.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,s.jsxs)(l.A,{children:[(0,s.jsx)(i.A,{value:"with-base-url",label:(0,s.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["With ",(0,s.jsx)(n.code,{children:"baseUrl"})]}),default:!0,children:(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"import { requestFn } from '@openapi-qraft/react';\n\n/**\n * Executes the request:\n * ###\n * PATCH /posts/123\n *\n * { \"title\": \"New title\" }\n **/\nconst posts = await qraft.posts.updatePost(\n  {\n    parameters: { path: { post_id: 123 } },\n    body: { title: 'New title' },\n    baseUrl: 'https://api.sandbox.monite.com/v1',\n  },\n  requestFn\n);\n"})})}),(0,s.jsx)(i.A,{value:"no-base-url",label:(0,s.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["No ",(0,s.jsx)(n.code,{style:{textDecoration:"line-through"},children:"baseUrl"})]}),children:(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"import {\n  requestFn,\n  type RequestFnPayload,\n  type OperationSchema,\n} from '@openapi-qraft/react';\n\n/**\n * Executes the request:\n * ###\n * PATCH /posts/123\n *\n * { \"title\": \"New title\" }\n **/\nconst posts = await qraft.posts.updatePost(\n  {\n    parameters: { path: { post_id: 123 } },\n    body: { title: 'New title' },\n  },\n  customRequestFn\n);\n\n/**\n * Custom request function with the predefined base URL\n **/\nconst customRequestFn = async <T,>(\n  requestSchema: OperationSchema,\n  requestInfo: Omit<RequestFnPayload, 'baseUrl'>\n): Promise<T> =>\n  requestFn(requestSchema, {\n    ...requestInfo,\n    baseUrl: 'https://api.sandbox.monite.com/v1',\n  });\n"})})})]})]})}function p(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>l,x:()=>i});var r=t(3696);const s={},a=r.createContext(s);function l(e){const n=r.useContext(a);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),r.createElement(a.Provider,{value:n},e.children)}}}]);