"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[3890],{9393:(e,n,s)=>{s.d(n,{A:()=>l});s(3696);var r=s(1750);const i={tabItem:"tabItem_wHwb"};var t=s(2540);function l(e){let{children:n,hidden:s,className:l}=e;return(0,t.jsx)("div",{role:"tabpanel",className:(0,r.A)(i.tabItem,l),hidden:s,children:n})}},9942:(e,n,s)=>{s.d(n,{A:()=>w});var r=s(3696),i=s(1750),t=s(5162),l=s(9519),a=s(5367),c=s(271),o=s(5476),d=s(5095);function p(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:s}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return p(e).map((e=>{let{props:{value:n,label:s,attributes:r,default:i}}=e;return{value:n,label:s,attributes:r,default:i}}))}(s);return function(e){const n=(0,o.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,s])}function x(e){let{value:n,tabValues:s}=e;return s.some((e=>e.value===n))}function u(e){let{queryString:n=!1,groupId:s}=e;const i=(0,l.W6)(),t=function(e){let{queryString:n=!1,groupId:s}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!s)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return s??null}({queryString:n,groupId:s});return[(0,c.aZ)(t),(0,r.useCallback)((e=>{if(!t)return;const n=new URLSearchParams(i.location.search);n.set(t,e),i.replace({...i.location,search:n.toString()})}),[t,i])]}function j(e){const{defaultValue:n,queryString:s=!1,groupId:i}=e,t=h(e),[l,c]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:s}=e;if(0===s.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!x({value:n,tabValues:s}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${s.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=s.find((e=>e.default))??s[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:t}))),[o,p]=u({queryString:s,groupId:i}),[j,m]=function(e){let{groupId:n}=e;const s=function(e){return e?`docusaurus.tab.${e}`:null}(n),[i,t]=(0,d.Dv)(s);return[i,(0,r.useCallback)((e=>{s&&t.set(e)}),[s,t])]}({groupId:i}),g=(()=>{const e=o??j;return x({value:e,tabValues:t})?e:null})();(0,a.A)((()=>{g&&c(g)}),[g]);return{selectedValue:l,selectValue:(0,r.useCallback)((e=>{if(!x({value:e,tabValues:t}))throw new Error(`Can't select invalid tab value=${e}`);c(e),p(e),m(e)}),[p,m,t]),tabValues:t}}var m=s(1173);const g={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var f=s(2540);function b(e){let{className:n,block:s,selectedValue:r,selectValue:l,tabValues:a}=e;const c=[],{blockElementScrollPositionUntilNextRender:o}=(0,t.a_)(),d=e=>{const n=e.currentTarget,s=c.indexOf(n),i=a[s].value;i!==r&&(o(n),l(i))},p=e=>{let n=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const s=c.indexOf(e.currentTarget)+1;n=c[s]??c[0];break}case"ArrowLeft":{const s=c.indexOf(e.currentTarget)-1;n=c[s]??c[c.length-1];break}}n?.focus()};return(0,f.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.A)("tabs",{"tabs--block":s},n),children:a.map((e=>{let{value:n,label:s,attributes:t}=e;return(0,f.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>c.push(e),onKeyDown:p,onClick:d,...t,className:(0,i.A)("tabs__item",g.tabItem,t?.className,{"tabs__item--active":r===n}),children:s??n},n)}))})}function y(e){let{lazy:n,children:s,selectedValue:t}=e;const l=(Array.isArray(s)?s:[s]).filter(Boolean);if(n){const e=l.find((e=>e.props.value===t));return e?(0,r.cloneElement)(e,{className:(0,i.A)("margin-top--md",e.props.className)}):null}return(0,f.jsx)("div",{className:"margin-top--md",children:l.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==t})))})}function v(e){const n=j(e);return(0,f.jsxs)("div",{className:(0,i.A)("tabs-container",g.tabList),children:[(0,f.jsx)(b,{...n,...e}),(0,f.jsx)(y,{...n,...e})]})}function w(e){const n=(0,m.A)();return(0,f.jsx)(v,{...e,children:p(e.children)},String(n))}},5172:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>d,contentTitle:()=>c,default:()=>x,frontMatter:()=>a,metadata:()=>o,toc:()=>p});var r=s(2540),i=s(3023),t=s(9942),l=s(9393);const a={sidebar_position:1,sidebar_label:"CLI"},c="OpenAPI Qraft CLI",o={id:"codegen/CLI/cli",title:"OpenAPI Qraft CLI",description:"OpenAPI Qraft CLI is a command-line utility that generates API schemas and interfaces for the @openapi-qraft/react.",source:"@site/docs/codegen/CLI/cli.mdx",sourceDirName:"codegen/CLI",slug:"/codegen/CLI/",permalink:"/openapi-qraft/docs/next/codegen/CLI/",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/codegen/CLI/cli.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1,sidebar_label:"CLI"},sidebar:"mainDocsSidebar",previous:{title:"Quick Start",permalink:"/openapi-qraft/docs/next/getting-started/quick-start"},next:{title:"--operation-predefined-parameters",permalink:"/openapi-qraft/docs/next/codegen/CLI/create-predefined-parameters-request-fn"}},d={},p=[{value:"Usage example",id:"usage-example",level:2},{value:"Options",id:"options",level:2},{value:"Required",id:"required",level:3},{value:"Edge-case Options",id:"edge-case-options",level:3},{value:"Plugin System",id:"plugin-system",level:2},{value:"<code>--plugin tanstack-query-react</code> options",id:"--plugin-tanstack-query-react-options",level:3},{value:"<code>--plugin openapi-typescript</code> options",id:"--plugin-openapi-typescript-options",level:3},{value:"In-project Setup",id:"in-project-setup",level:2}];function h(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",del:"del",em:"em",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"openapi-qraft-cli",children:"OpenAPI Qraft CLI"})}),"\n",(0,r.jsxs)(n.p,{children:["OpenAPI Qraft CLI is a command-line utility that generates API schemas and interfaces for the ",(0,r.jsx)(n.code,{children:"@openapi-qraft/react"}),".\nWith the ",(0,r.jsx)(n.code,{children:"@openapi-qraft/cli"})," and ",(0,r.jsx)(n.code,{children:"@openapi-qraft/react"})," packages, you can build a type-safe API client with React Hooks\nbased on the OpenAPI Document."]}),"\n",(0,r.jsxs)(n.p,{children:["Qraft relies on types from the generation result of ",(0,r.jsx)(n.a,{href:"https://www.npmjs.com/package/openapi-typescript",children:(0,r.jsx)(n.code,{children:"openapi-typescript"})})," package,\nwhich is a powerful tool for generating types from an OpenAPI schema."]}),"\n",(0,r.jsxs)(n.admonition,{type:"tip",children:[(0,r.jsxs)(n.p,{children:["If you missed the ",(0,r.jsx)(n.a,{href:"/openapi-qraft/docs/next/getting-started/installation",children:"installation"})," step, you can install the ",(0,r.jsx)(n.code,{children:"@openapi-qraft/cli"})," using the following command:"]}),(0,r.jsxs)(t.A,{groupId:"npm2yarn",children:[(0,r.jsx)(l.A,{value:"npm",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"npm install -D @openapi-qraft/cli@next\n"})})}),(0,r.jsx)(l.A,{value:"yarn",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"yarn add --dev @openapi-qraft/cli@next\n"})})}),(0,r.jsx)(l.A,{value:"pnpm",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"pnpm add -D @openapi-qraft/cli@next\n"})})})]})]}),"\n",(0,r.jsx)(n.h2,{id:"usage-example",children:"Usage example"}),"\n",(0,r.jsxs)(n.p,{children:["The command below generates Qraft API services for the OpenAPI schema and places them in the ",(0,r.jsx)(n.code,{children:"src/api"})," directory:"]}),"\n",(0,r.jsxs)(t.A,{groupId:"npm2yarn",children:[(0,r.jsx)(l.A,{value:"npm",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"npx openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api\n"})})}),(0,r.jsx)(l.A,{value:"yarn",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"yarn exec openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api\n"})})}),(0,r.jsx)(l.A,{value:"pnpm",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"pnpm exec openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api\n"})})})]}),"\n",(0,r.jsx)(n.h2,{id:"options",children:"Options"}),"\n",(0,r.jsx)(n.h3,{id:"required",children:"Required"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"-o <path>, --output-dir <path>"}),":"]})," Specify where to output the generated services.","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["Example: ",(0,r.jsx)(n.code,{children:"--output-dir src/api"})]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"edge-case-options",children:"Edge-case Options"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"-rm, --clean"}),":"]})," Clean the specified output directory services before generating to remove stale files ",(0,r.jsx)(n.em,{children:"(optional)"}),"."]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"--filter-services <glob-patterns...>"}),":"]})," Filter services to be generated by glob pattern ",(0,r.jsx)(n.em,{children:"(optional)"}),"."]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Pattern syntax:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"<glob-pattern>,<glob-pattern>,..."})," - comma-separated list of glob patterns. See ",(0,r.jsx)(n.a,{href:"https://github.com/micromatch/micromatch",children:(0,r.jsx)(n.code,{children:"micromatch"})}),"\npackage for more details. More than one pattern can be specified."]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["Examples:","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--filter-services '/user/**,/post/**'"})," - include only API endpoints that start with ",(0,r.jsx)(n.code,{children:"/user/"})," or ",(0,r.jsx)(n.code,{children:"/post/"})]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--filter-services '**,!/internal/**'"})," - include ",(0,r.jsx)(n.em,{children:"all"})," API endpoints ",(0,r.jsx)(n.em,{children:"except"})," those that start with ",(0,r.jsx)(n.code,{children:"/internal/"})]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"--operation-predefined-parameters <patterns...> "}),":"]})," Predefined parameters for services. The specified services parameters will be optional. ",(0,r.jsx)(n.em,{children:"(optional)"})]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Pattern syntax:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"<path glob>:<operation parameter>,..."})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"<method> <path glob>:<operation parameter>,..."})}),"\n",(0,r.jsxs)(n.li,{children:["Each modifier consists of an ",(0,r.jsx)(n.em,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"method"}),", a ",(0,r.jsx)(n.strong,{children:"path glob"})," pattern,\na colon, and a comma-separated list of ",(0,r.jsx)(n.strong,{children:"operation parameters"})," to be set as optional.\nMore than one predefined parameter option can be specified."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["This option \ud83d\udc8e is arguably one of the most awesome features, allowing you to ",(0,r.jsx)(n.strong,{children:"set default parameters"})," across multiple endpoints.\nHowever, if an endpoint doesn't contain a parameter specified in this option, an error will be displayed. For example:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-text",children:"\u26a0 Missing predefined parameter 'header' 'x-monite-version' in 'post /files' in '/**'\n"})}),"\n",(0,r.jsx)(n.p,{children:"To resolve such errors, you can exclude specific endpoints from the predefined parameters using the negation syntax in the glob pattern, like:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{children:"--operation-predefined-parameters '/**,!/files:header.x-monite-version'\n"})}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["Examples:","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--operation-predefined-parameters '/**:header.x-monite-version'"})," - set ",(0,r.jsx)(n.code,{children:"header.x-monite-version"}),"\nas optional parameters for all services."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--operation-predefined-parameters '/**,!/auth/token:header.x-entity-id'"})," - set ",(0,r.jsx)(n.code,{children:"header.x-entity-id"})," as optional parameters for all services except ",(0,r.jsx)(n.code,{children:"/auth/token"}),"."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--operation-predefined-parameters 'post,put /**:header.x-entity-id'"})," - set the ",(0,r.jsx)(n.code,{children:"Header"})," record ",(0,r.jsx)(n.code,{children:"x-entity-id"})," as an optional parameter for the ",(0,r.jsx)(n.code,{children:"POST"})," and ",(0,r.jsx)(n.code,{children:"PUT"})," methods."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"Note:"})," In future versions of the library, this feature will be expanded. Not only will it make parameters\noptional, but it will also offer typed suggestions for these predefined parameters when creating a client. This enhancement will\nfurther improve type safety and developer experience."]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"--operation-name-modifier <patterns...>"}),":"]})," Modifies operation names using a pattern."]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Pattern syntax:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"<path glob>:<regular expression> ==> <new operation name>"})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"<method> <path glob>:<regular expression> ==> <new operation name>"})}),"\n",(0,r.jsxs)(n.li,{children:["Each modifier consists of an ",(0,r.jsx)(n.em,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"method"}),", a ",(0,r.jsx)(n.strong,{children:"path glob"})," pattern,\na colon, and a ",(0,r.jsx)(n.strong,{children:"regular expression"})," that matches the operation name. The part after ",(0,r.jsx)(n.code,{children:"==>"})," is the new operation name.\nMore than one modifier option can be specified."]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["Examples:","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--operation-name-modifier 'get /**:[A-Za-z]+Id ==> findOne'"})," - will change all ",(0,r.jsx)(n.code,{children:"GET"})," operations with ",(0,r.jsx)(n.code,{children:"Id"})," suffix to ",(0,r.jsx)(n.code,{children:"findOne"}),"."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--operation-name-modifier 'get /**:get(.*) ==> find-$1'"})," - will change all ",(0,r.jsx)(n.code,{children:"GET"})," operations with ",(0,r.jsx)(n.code,{children:"get"})," prefix to ",(0,r.jsx)(n.code,{children:"findById | findAll | ..."}),".","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"The pattern is a regular expression that matches the operation name."}),"\n",(0,r.jsx)(n.li,{children:"The operation name is converted to Camel Case. Spaces, hyphens, and underscores are removed."}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--operation-name-modifier 'put,patch /**:[A-Za-z]+Id ==> updateOne'"})," - will change all ",(0,r.jsx)(n.code,{children:"PUT"})," and ",(0,r.jsx)(n.code,{children:"PATCH"})," operations with ",(0,r.jsx)(n.code,{children:"Id"})," suffix to ",(0,r.jsx)(n.code,{children:"updateOne"}),"."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--operation-name-modifier '/posts,/files:create[a-zA-Z]+ ==> createOne'"})," - will change all operations under ",(0,r.jsx)(n.code,{children:"/posts"})," and ",(0,r.jsx)(n.code,{children:"/files"})," to ",(0,r.jsx)(n.code,{children:"createOne"})," if the operation name starts with ",(0,r.jsx)(n.code,{children:"create"}),"."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--operation-name-modifier 'post /files ==> createOne' 'put /posts ==> updateOne'"})," - will change all ",(0,r.jsx)(n.code,{children:"POST"})," operations under ",(0,r.jsx)(n.code,{children:"/files"})," to ",(0,r.jsx)(n.code,{children:"createOne"})," and all ",(0,r.jsx)(n.code,{children:"PUT"})," operations under ",(0,r.jsx)(n.code,{children:"/posts"})," to ",(0,r.jsx)(n.code,{children:"updateOne"}),"."]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"--service-name-base <endpoint[<index>] | tags>"}),":"]})," Use OpenAPI Operation ",(0,r.jsx)(n.code,{children:"endpoint[<index>]"})," path part (e.g.: ",(0,r.jsx)(n.code,{children:"/0/1/2"}),") or ",(0,r.jsx)(n.code,{children:"tags"})," as the base name of the service. ",(0,r.jsxs)(n.em,{children:["(optional, default: ",(0,r.jsx)(n.code,{children:"endpoint[0]"}),")"]}),"."]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["Examples:","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--service-name-base endpoint[0]"})," generates ",(0,r.jsx)(n.code,{children:"services/FooService.ts"})," for the endpoint ",(0,r.jsx)(n.code,{children:"/foo/bar/baz"})]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--service-name-base endpoint[1]"})," generates ",(0,r.jsx)(n.code,{children:"services/BarService.ts"})," for the endpoint ",(0,r.jsx)(n.code,{children:"/foo/bar/baz"})]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--service-name-base endpoint[3]"})," generates ",(0,r.jsx)(n.code,{children:"services/BazService.ts"})," for the endpoint ",(0,r.jsx)(n.code,{children:"/foo/bar/baz"})," ",(0,r.jsx)(n.em,{children:"(if the endpoint is shorter than the index, the last part is used)"})]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--service-name-base tags"})," will generate services based on the OpenAPI Operation tags instead of the endpoint.","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["If multiple tags are present for the operation, similar services will be created for each tag. Operation with ",(0,r.jsx)(n.code,{children:"tags: [Foo, Bar]"})," will generate ",(0,r.jsx)(n.code,{children:"services/FooService.ts"})," and ",(0,r.jsx)(n.code,{children:"services/BarService.ts"}),"."]}),"\n",(0,r.jsxs)(n.li,{children:["If there are no tags for the operation, the services will be created under the ",(0,r.jsx)(n.code,{children:"default"})," tag. Operation with empty ",(0,r.jsx)(n.code,{children:"tags: []"})," will generate ",(0,r.jsx)(n.code,{children:"services/DefaultService.ts"}),"."]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"--explicit-import-extensions"}),":"]})," Include explicit ",(0,r.jsx)(n.code,{children:".js"})," extensions in all import statements. Ideal for projects using ECMAScript modules when TypeScript's ",(0,r.jsx)(n.em,{children:"--moduleResolution"})," is ",(0,r.jsx)(n.code,{children:"node16"})," or ",(0,r.jsx)(n.code,{children:"nodenext"})," ",(0,r.jsx)(n.em,{children:"(optional)"}),"."]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"--file-header <string>"}),":"]})," Add a custom header to each generated file, useful for disabling linting rules or adding file\ncomments ",(0,r.jsx)(n.em,{children:"(optional)"}),"."]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["Example: ",(0,r.jsx)(n.code,{children:"--file-header '/* eslint-disable */'"})]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"--postfix-services <string>"}),":"]})," Customize the generated service names with a specific postfix ",(0,r.jsxs)(n.em,{children:["(optional, default: ",(0,r.jsx)(n.code,{children:"Service"}),")"]}),"."]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["Example: ",(0,r.jsx)(n.code,{children:"--postfix-services Endpoint"})," will generate ",(0,r.jsx)(n.code,{children:"services/UserEndpoint.ts"})," instead of ",(0,r.jsx)(n.code,{children:"services/UserService.ts"}),"."]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--plugin <name_1> --plugin <name_2>"})}),": Generator plugins to be used. (choices: ",(0,r.jsx)(n.code,{children:"tanstack-query-react"}),", ",(0,r.jsx)(n.code,{children:"openapi-typescript"}),")"]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["Examples:","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--plugin tanstack-query-react --plugin openapi-typescript"})," generates Qraft Services and ",(0,r.jsx)(n.code,{children:"openapi-typescript"})," types file."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--plugin tanstack-query-react"})," generates Qraft Services only."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"--plugin openapi-typescript"})," generates ",(0,r.jsx)(n.a,{href:"https://github.com/drwpow/openapi-typescript",children:(0,r.jsx)(n.code,{children:"openapi-typescript"})})," types file only."]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"-h, --help"}),":"]})," Display help for the command (optional)."]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"plugin-system",children:"Plugin System"}),"\n",(0,r.jsx)(n.p,{children:"The following plugins are currently supported:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"openapi-typescript"})," - Generates TypeScript types from an OpenAPI Document. The main difference from the original ",(0,r.jsx)(n.a,{href:"https://www.npmjs.com/package/openapi-typescript",children:(0,r.jsx)(n.code,{children:"openapi-typescript"})})," package is that ",(0,r.jsx)(n.code,{children:"format: binary"})," fields default to ",(0,r.jsx)(n.code,{children:"Blob"})," types instead of remaining as ",(0,r.jsx)(n.code,{children:"string"}),". This behavior can be altered using the ",(0,r.jsx)(n.code,{children:"--no-blob-from-binary"})," option."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"tanstack-query-react"})," - Generates Qraft API services for React."]}),"\n"]}),"\n",(0,r.jsx)(n.admonition,{type:"tip",children:(0,r.jsxs)(n.p,{children:["Plugin must be provided with the ",(0,r.jsx)(n.code,{children:"--plugin <name>"})," option. By default, the ",(0,r.jsx)(n.code,{children:"tanstack-query-react"})," plugin is used.\nIt is possible to use multiple plugins at the same time. For example, ",(0,r.jsx)(n.code,{children:"--plugin tanstack-query-react --plugin openapi-typescript"})," generates Qraft API services & schema types file."]})}),"\n",(0,r.jsxs)(n.h3,{id:"--plugin-tanstack-query-react-options",children:[(0,r.jsx)(n.code,{children:"--plugin tanstack-query-react"})," options"]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"--openapi-types-import-path <path>"}),":"]})," Set the path to the schema types definition file to ensure consistent type\nusage (assumed, you already have ",(0,r.jsx)(n.code,{children:"schema.d.ts"})," as a result of the ",(0,r.jsx)(n.a,{href:"https://github.com/drwpow/openapi-typescript",children:(0,r.jsx)(n.code,{children:"openapi-typescript"})})," utility). You also probably\ndon't need the ",(0,r.jsx)(n.del,{children:(0,r.jsx)(n.code,{children:"--plugin openapi-typescript"})})," option in this case.","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["The path is the exact import specifier used in the ",(0,r.jsx)(n.em,{children:"generated services"}),". It should be ",(0,r.jsx)(n.em,{children:"relative"})," to the service\noutput directory. ",(0,r.jsx)(n.em,{children:"Optional"}),", if the ",(0,r.jsx)(n.code,{children:"--plugin openapi-typescript"})," is used. ",(0,r.jsx)(n.em,{children:"Required"})," otherwise.","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["Examples:","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"--openapi-types-import-path ../openapi.d.ts"})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"--openapi-types-import-path '@/api/openapi.d.ts'"})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"--openapi-types-import-path '@external-package-types'"})}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"--operation-generics-import-path <path>"}),":"]})," Define the path to the operation generics file, allowing for custom\noperation handling ",(0,r.jsxs)(n.em,{children:["(optional, default: ",(0,r.jsx)(n.code,{children:"@openapi-qraft/react"}),")"]}),"."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsxs)(n.strong,{children:[(0,r.jsx)(n.code,{children:"--export-openapi-types [bool]"}),":"]})," Export the OpenAPI schema types from the generated ",(0,r.jsx)(n.code,{children:"./index.ts"})," file. ",(0,r.jsxs)(n.em,{children:["(optional, default: ",(0,r.jsx)(n.code,{children:"true"}),", if ",(0,r.jsx)(n.code,{children:"--plugin openapi-typescript"})," is used)"]})]}),"\n"]}),"\n",(0,r.jsxs)(n.h3,{id:"--plugin-openapi-typescript-options",children:[(0,r.jsx)(n.code,{children:"--plugin openapi-typescript"})," options"]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--openapi-types-file-name <path>"})}),": OpenAPI Schema types file name, e.g., ",(0,r.jsx)(n.code,{children:"schema.d.ts"})," (default: ",(0,r.jsx)(n.code,{children:"schema.ts"}),")."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--enum"})}),": Export true TypeScript enums instead of unions."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--enum-values"})}),": Export enum values as arrays."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--dedupe-enums"})}),": Dedupe enum types when ",(0,r.jsx)(n.code,{children:"--enum"})," is set."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"-t, --export-type"})}),": Export top-level ",(0,r.jsx)(n.code,{children:"type"})," instead of ",(0,r.jsx)(n.code,{children:"interface"}),"."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--immutable"})}),": Generate readonly types."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--additional-properties"})}),": Treat schema objects as if ",(0,r.jsx)(n.code,{children:"additionalProperties: true"})," is set."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--empty-objects-unknown"})}),": Generate ",(0,r.jsx)(n.code,{children:"unknown"})," instead of ",(0,r.jsx)(n.code,{children:"Record<string, never>"})," for empty objects."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--default-non-nullable"})}),": Set to ",(0,r.jsx)(n.code,{children:"false"})," to ignore default values when generating non-nullable types."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--properties-required-by-default"})}),": Treat schema objects as if ",(0,r.jsx)(n.code,{children:"required"})," is set to all properties by default."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--array-length"})}),": Generate tuples using array ",(0,r.jsx)(n.code,{children:"minItems"})," / ",(0,r.jsx)(n.code,{children:"maxItems"}),"."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--path-params-as-types"})}),": Convert paths to template literal types."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--alphabetize"})}),": Sort object keys alphabetically."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--exclude-deprecated"})}),": Exclude deprecated types."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--no-blob-from-binary"})}),": If this option is enabled, ",(0,r.jsx)(n.code,{children:"format: binary"})," fields will not be converted to ",(0,r.jsx)(n.code,{children:"Blob"})," types, preserving the native type. Could be used with ",(0,r.jsx)(n.code,{children:"--plugin openapi-typescript"})," option."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"--explicit-component-exports"})}),": Enabling this option will export API components as separate type aliases, alongside ",(0,r.jsx)(n.code,{children:"components"})," interface."]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"in-project-setup",children:"In-project Setup"}),"\n",(0,r.jsxs)(n.p,{children:["Add the following ",(0,r.jsx)(n.code,{children:'"scripts"'})," to your ",(0,r.jsx)(n.code,{children:"package.json"})," file:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-json5",metastring:'title="package.json"',children:'{\n  "scripts": {\n    "generate-client": "openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml --output-dir src/api",\n    // ...other scripts\n  }\n}\n'})})]})}function x(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},3023:(e,n,s)=>{s.d(n,{R:()=>l,x:()=>a});var r=s(3696);const i={},t=r.createContext(i);function l(e){const n=r.useContext(t);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),r.createElement(t.Provider,{value:n},e.children)}}}]);