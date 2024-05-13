"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[6288],{5326:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>d,contentTitle:()=>a,default:()=>u,frontMatter:()=>c,metadata:()=>o,toc:()=>p});var i=s(2540),r=s(3023),t=s(8296),l=s(2491);const c={sidebar_position:1,sidebar_label:"CLI"},a="OpenAPI Qraft CLI",o={id:"codegen/cli",title:"OpenAPI Qraft CLI",description:"OpenAPI Qraft CLI is a command-line utility that generates API schemas and interfaces for the @openapi-qraft/react.",source:"@site/docs/codegen/cli.mdx",sourceDirName:"codegen",slug:"/codegen/cli",permalink:"/openapi-qraft/docs/codegen/cli",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/codegen/cli.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1,sidebar_label:"CLI"},sidebar:"mainDocsSidebar",previous:{title:"Quick Start",permalink:"/openapi-qraft/docs/getting-started/quick-start"},next:{title:"createAPIClient",permalink:"/openapi-qraft/docs/codegen/create-api-client-function"}},d={},p=[{value:"Usage example",id:"usage-example",level:2},{value:"Options",id:"options",level:2},{value:"Required",id:"required",level:3},{value:"Edge-case Options",id:"edge-case-options",level:3},{value:"Plugin System",id:"plugin-system",level:2},{value:"<code>--plugin tanstack-query-react</code> options",id:"--plugin-tanstack-query-react-options",level:3},{value:"<code>--plugin openapi-typescript</code> options",id:"--plugin-openapi-typescript-options",level:3},{value:"In-project Setup",id:"in-project-setup",level:2}];function h(e){const n={a:"a",admonition:"admonition",code:"code",del:"del",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,r.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h1,{id:"openapi-qraft-cli",children:"OpenAPI Qraft CLI"}),"\n",(0,i.jsxs)(n.p,{children:["OpenAPI Qraft CLI is a command-line utility that generates API schemas and interfaces for the ",(0,i.jsx)(n.code,{children:"@openapi-qraft/react"}),".\nWith the ",(0,i.jsx)(n.code,{children:"@openapi-qraft/cli"})," and ",(0,i.jsx)(n.code,{children:"@openapi-qraft/react"})," packages, you can build a type-safe API client with React Hooks\nbased on the OpenAPI Document."]}),"\n",(0,i.jsxs)(n.p,{children:["Qraft relies on types from the generation result of ",(0,i.jsx)(n.a,{href:"https://www.npmjs.com/package/openapi-typescript",children:(0,i.jsx)(n.code,{children:"openapi-typescript"})})," package,\nwhich is a powerful tool for generating types from an OpenAPI schema."]}),"\n",(0,i.jsxs)(n.admonition,{type:"tip",children:[(0,i.jsxs)(n.p,{children:["If you missed the ",(0,i.jsx)(n.a,{href:"/openapi-qraft/docs/getting-started/installation",children:"installation"})," step, you can install the ",(0,i.jsx)(n.code,{children:"@openapi-qraft/cli"})," using the following command:"]}),(0,i.jsxs)(t.A,{groupId:"npm2yarn",children:[(0,i.jsx)(l.A,{value:"npm",children:(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"npm install -D @openapi-qraft/cli\n"})})}),(0,i.jsx)(l.A,{value:"yarn",children:(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"yarn add --dev @openapi-qraft/cli\n"})})}),(0,i.jsx)(l.A,{value:"pnpm",children:(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"pnpm add -D @openapi-qraft/cli\n"})})})]})]}),"\n",(0,i.jsx)(n.h2,{id:"usage-example",children:"Usage example"}),"\n",(0,i.jsxs)(n.p,{children:["The command below generates Qraft API services for the OpenAPI schema and places them in the ",(0,i.jsx)(n.code,{children:"src/api"})," directory:"]}),"\n",(0,i.jsxs)(t.A,{groupId:"npm2yarn",children:[(0,i.jsx)(l.A,{value:"npm",children:(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"npx openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api\n"})})}),(0,i.jsx)(l.A,{value:"yarn",children:(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"yarn exec openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api\n"})})}),(0,i.jsx)(l.A,{value:"pnpm",children:(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"pnpm exec openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api\n"})})})]}),"\n",(0,i.jsx)(n.h2,{id:"options",children:"Options"}),"\n",(0,i.jsx)(n.h3,{id:"required",children:"Required"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"-o <path>, --output-dir <path>"}),":"]})," Specify where to output the generated services.","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Example: ",(0,i.jsx)(n.code,{children:"--output-dir src/api"})]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"edge-case-options",children:"Edge-case Options"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"-rm, --clean"}),":"]})," Clean the specified output directory services before generating to remove stale files ",(0,i.jsx)(n.em,{children:"(optional)"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"--filter-services"}),":"]})," Filter services to be generated by glob pattern ",(0,i.jsx)(n.em,{children:"(optional)"}),". See ",(0,i.jsx)(n.a,{href:"https://github.com/micromatch/micromatch",children:(0,i.jsx)(n.code,{children:"micromatch"})}),"\npackage for more details.","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Examples:","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--filter-services '/user/**,/post/**'"})," - include only API endpoints that start with ",(0,i.jsx)(n.code,{children:"/user/"})," or ",(0,i.jsx)(n.code,{children:"/post/"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--filter-services '**,!/internal/**'"})," - include ",(0,i.jsx)(n.em,{children:"all"})," API endpoints ",(0,i.jsx)(n.em,{children:"except"})," those that start with ",(0,i.jsx)(n.code,{children:"/internal/"})]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"--service-name-base <endpoint[<index>] | tags>"}),":"]})," Use OpenAPI Operation ",(0,i.jsx)(n.code,{children:"endpoint[<index>]"})," path part (e.g.: ",(0,i.jsx)(n.code,{children:"/0/1/2"}),") or ",(0,i.jsx)(n.code,{children:"tags"})," as the base name of the service. ",(0,i.jsxs)(n.em,{children:["(optional, default: ",(0,i.jsx)(n.code,{children:"endpoint[0]"}),")"]}),".","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Examples:","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--service-name-base endpoint[0]"})," generates ",(0,i.jsx)(n.code,{children:"services/FooService.ts"})," for the endpoint ",(0,i.jsx)(n.code,{children:"/foo/bar/baz"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--service-name-base endpoint[1]"})," generates ",(0,i.jsx)(n.code,{children:"services/BarService.ts"})," for the endpoint ",(0,i.jsx)(n.code,{children:"/foo/bar/baz"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--service-name-base endpoint[3]"})," generates ",(0,i.jsx)(n.code,{children:"services/BazService.ts"})," for the endpoint ",(0,i.jsx)(n.code,{children:"/foo/bar/baz"})," ",(0,i.jsx)(n.em,{children:"(if the endpoint is shorter than the index, the last part is used)"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--service-name-base tags"})," will generate services based on the OpenAPI Operation tags instead of the endpoint.","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["If multiple tags are present for the operation, similar services will be created for each tag. Operation with ",(0,i.jsx)(n.code,{children:"tags: [Foo, Bar]"})," will generate ",(0,i.jsx)(n.code,{children:"services/FooService.ts"})," and ",(0,i.jsx)(n.code,{children:"services/BarService.ts"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:["If there are no tags for the operation, the services will be created under the ",(0,i.jsx)(n.code,{children:"default"})," tag. Operation with empty ",(0,i.jsx)(n.code,{children:"tags: []"})," will generate ",(0,i.jsx)(n.code,{children:"services/DefaultService.ts"}),"."]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"--explicit-import-extensions"}),":"]})," Include explicit ",(0,i.jsx)(n.code,{children:".js"})," extensions in all import statements. Ideal for projects using ECMAScript modules when TypeScript's ",(0,i.jsx)(n.em,{children:"--moduleResolution"})," is ",(0,i.jsx)(n.code,{children:"node16"})," or ",(0,i.jsx)(n.code,{children:"nodenext"})," ",(0,i.jsx)(n.em,{children:"(optional)"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"--file-header <string>"}),":"]})," Add a custom header to each generated file, useful for disabling linting rules or adding file\ncomments ",(0,i.jsx)(n.em,{children:"(optional)"}),".","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Example: ",(0,i.jsx)(n.code,{children:"--file-header '/* eslint-disable */'"})]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"--postfix-services <string>"}),":"]})," Customize the generated service names with a specific postfix ",(0,i.jsxs)(n.em,{children:["(optional, default: ",(0,i.jsx)(n.code,{children:"Service"}),")"]}),".","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Example: ",(0,i.jsx)(n.code,{children:"--postfix-services Endpoint"})," will generate ",(0,i.jsx)(n.code,{children:"services/UserEndpoint.ts"})," instead of ",(0,i.jsx)(n.code,{children:"services/UserService.ts"}),"."]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--plugin <name_1> --plugin <name_2>"})}),": Generator plugins to be used. (choices: ",(0,i.jsx)(n.code,{children:"tanstack-query-react"}),", ",(0,i.jsx)(n.code,{children:"openapi-typescript"}),")","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Examples:","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--plugin tanstack-query-react --plugin openapi-typescript"})," generates Qraft Services and ",(0,i.jsx)(n.code,{children:"openapi-typescript"})," types file."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--plugin tanstack-query-react"})," generates Qraft Services only."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--plugin openapi-typescript"})," generates ",(0,i.jsx)(n.a,{href:"https://github.com/drwpow/openapi-typescript",children:(0,i.jsx)(n.code,{children:"openapi-typescript"})})," types file only."]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"-h, --help"}),":"]})," Display help for the command (optional)."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"plugin-system",children:"Plugin System"}),"\n",(0,i.jsx)(n.p,{children:"The following plugins are currently supported:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"openapi-typescript"})," - Generates TypeScript types from an OpenAPI Document. The main difference from the original ",(0,i.jsx)(n.a,{href:"https://www.npmjs.com/package/openapi-typescript",children:(0,i.jsx)(n.code,{children:"openapi-typescript"})})," package is that ",(0,i.jsx)(n.code,{children:"format: binary"})," fields default to ",(0,i.jsx)(n.code,{children:"Blob"})," types instead of remaining as ",(0,i.jsx)(n.code,{children:"string"}),". This behavior can be altered using the ",(0,i.jsx)(n.code,{children:"--no-blob-from-binary"})," option."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"tanstack-query-react"})," - Generates Qraft API services for React."]}),"\n"]}),"\n",(0,i.jsx)(n.admonition,{type:"tip",children:(0,i.jsxs)(n.p,{children:["Plugin must be provided with the ",(0,i.jsx)(n.code,{children:"--plugin <name>"})," option. By default, the ",(0,i.jsx)(n.code,{children:"tanstack-query-react"})," plugin is used.\nIt is possible to use multiple plugins at the same time. For example, ",(0,i.jsx)(n.code,{children:"--plugin tanstack-query-react --plugin openapi-typescript"})," generates Qraft API services & schema types file."]})}),"\n",(0,i.jsxs)(n.h3,{id:"--plugin-tanstack-query-react-options",children:[(0,i.jsx)(n.code,{children:"--plugin tanstack-query-react"})," options"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"--openapi-types-import-path <path>"}),":"]})," Set the path to the schema types definition file to ensure consistent type\nusage (assumed, you already have ",(0,i.jsx)(n.code,{children:"schema.d.ts"})," as a result of the ",(0,i.jsx)(n.a,{href:"https://github.com/drwpow/openapi-typescript",children:(0,i.jsx)(n.code,{children:"openapi-typescript"})})," utility). You also probably\ndon't need the ",(0,i.jsx)(n.del,{children:(0,i.jsx)(n.code,{children:"--plugin openapi-typescript"})})," option in this case.","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["The path is the exact import specifier used in the ",(0,i.jsx)(n.em,{children:"generated services"}),". It should be ",(0,i.jsx)(n.em,{children:"relative"})," to the service\noutput directory. ",(0,i.jsx)(n.em,{children:"Optional"}),", if the ",(0,i.jsx)(n.code,{children:"--plugin openapi-typescript"})," is used. ",(0,i.jsx)(n.em,{children:"Required"})," otherwise.","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Examples:","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.code,{children:"--openapi-types-import-path ../openapi.d.ts"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.code,{children:"--openapi-types-import-path '@/api/openapi.d.ts'"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.code,{children:"--openapi-types-import-path '@external-package-types'"})}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"--operation-generics-import-path <path>"}),":"]})," Define the path to the operation generics file, allowing for custom\noperation handling ",(0,i.jsxs)(n.em,{children:["(optional, default: ",(0,i.jsx)(n.code,{children:"@openapi-qraft/react"}),")"]}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:[(0,i.jsx)(n.code,{children:"--export-openapi-types [bool]"}),":"]})," Export the OpenAPI schema types from the generated ",(0,i.jsx)(n.code,{children:"./index.ts"})," file. ",(0,i.jsxs)(n.em,{children:["(optional, default: ",(0,i.jsx)(n.code,{children:"true"}),", if ",(0,i.jsx)(n.code,{children:"--plugin openapi-typescript"})," is used)"]})]}),"\n"]}),"\n",(0,i.jsxs)(n.h3,{id:"--plugin-openapi-typescript-options",children:[(0,i.jsx)(n.code,{children:"--plugin openapi-typescript"})," options"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--openapi-types-file-name <path>"})}),": OpenAPI Schema types file name, e.g., ",(0,i.jsx)(n.code,{children:"schema.d.ts"})," (default: ",(0,i.jsx)(n.code,{children:"schema.ts"}),")."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--enum"})}),": Export true TypeScript enums instead of unions."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"-t, --export-type"})}),": Export top-level ",(0,i.jsx)(n.code,{children:"type"})," instead of ",(0,i.jsx)(n.code,{children:"interface"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--immutable"})}),": Generate readonly types."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--additional-properties"})}),": Treat schema objects as if ",(0,i.jsx)(n.code,{children:"additionalProperties: true"})," is set."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--empty-objects-unknown"})}),": Generate ",(0,i.jsx)(n.code,{children:"unknown"})," instead of ",(0,i.jsx)(n.code,{children:"Record<string, never>"})," for empty objects."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--default-non-nullable"})}),": Set to ",(0,i.jsx)(n.code,{children:"false"})," to ignore default values when generating non-nullable types."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--properties-required-by-default"})}),": Treat schema objects as if ",(0,i.jsx)(n.code,{children:"required"})," is set to all properties by default."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--array-length"})}),": Generate tuples using array ",(0,i.jsx)(n.code,{children:"minItems"})," / ",(0,i.jsx)(n.code,{children:"maxItems"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--path-params-as-types"})}),": Convert paths to template literal types."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--alphabetize"})}),": Sort object keys alphabetically."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--exclude-deprecated"})}),": Exclude deprecated types."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:(0,i.jsx)(n.code,{children:"--no-blob-from-binary"})}),": If this option is enabled, ",(0,i.jsx)(n.code,{children:"format: binary"})," fields will not be converted to ",(0,i.jsx)(n.code,{children:"Blob"})," types, preserving the native type. Could be used with ",(0,i.jsx)(n.code,{children:"--plugin openapi-typescript"})," option."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"in-project-setup",children:"In-project Setup"}),"\n",(0,i.jsxs)(n.p,{children:["Add the following ",(0,i.jsx)(n.code,{children:'"scripts"'})," to your ",(0,i.jsx)(n.code,{children:"package.json"})," file:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-json5",metastring:'title="package.json"',children:'{\n  "scripts": {\n    "generate-client": "openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml --output-dir src/api",\n    // ...other scripts\n  }\n}\n'})})]})}function u(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},2491:(e,n,s)=>{s.d(n,{A:()=>l});s(3696);var i=s(1750);const r={tabItem:"tabItem_wHwb"};var t=s(2540);function l(e){let{children:n,hidden:s,className:l}=e;return(0,t.jsx)("div",{role:"tabpanel",className:(0,i.A)(r.tabItem,l),hidden:s,children:n})}},8296:(e,n,s)=>{s.d(n,{A:()=>w});var i=s(3696),r=s(1750),t=s(766),l=s(9519),c=s(4395),a=s(5043),o=s(4544),d=s(8708);function p(e){return i.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,i.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:s}=e;return(0,i.useMemo)((()=>{const e=n??function(e){return p(e).map((e=>{let{props:{value:n,label:s,attributes:i,default:r}}=e;return{value:n,label:s,attributes:i,default:r}}))}(s);return function(e){const n=(0,o.X)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,s])}function u(e){let{value:n,tabValues:s}=e;return s.some((e=>e.value===n))}function x(e){let{queryString:n=!1,groupId:s}=e;const r=(0,l.W6)(),t=function(e){let{queryString:n=!1,groupId:s}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!s)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return s??null}({queryString:n,groupId:s});return[(0,a.aZ)(t),(0,i.useCallback)((e=>{if(!t)return;const n=new URLSearchParams(r.location.search);n.set(t,e),r.replace({...r.location,search:n.toString()})}),[t,r])]}function j(e){const{defaultValue:n,queryString:s=!1,groupId:r}=e,t=h(e),[l,a]=(0,i.useState)((()=>function(e){let{defaultValue:n,tabValues:s}=e;if(0===s.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!u({value:n,tabValues:s}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${s.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const i=s.find((e=>e.default))??s[0];if(!i)throw new Error("Unexpected error: 0 tabValues");return i.value}({defaultValue:n,tabValues:t}))),[o,p]=x({queryString:s,groupId:r}),[j,m]=function(e){let{groupId:n}=e;const s=function(e){return e?`docusaurus.tab.${e}`:null}(n),[r,t]=(0,d.Dv)(s);return[r,(0,i.useCallback)((e=>{s&&t.set(e)}),[s,t])]}({groupId:r}),g=(()=>{const e=o??j;return u({value:e,tabValues:t})?e:null})();(0,c.A)((()=>{g&&a(g)}),[g]);return{selectedValue:l,selectValue:(0,i.useCallback)((e=>{if(!u({value:e,tabValues:t}))throw new Error(`Can't select invalid tab value=${e}`);a(e),p(e),m(e)}),[p,m,t]),tabValues:t}}var m=s(6681);const g={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var f=s(2540);function b(e){let{className:n,block:s,selectedValue:i,selectValue:l,tabValues:c}=e;const a=[],{blockElementScrollPositionUntilNextRender:o}=(0,t.a_)(),d=e=>{const n=e.currentTarget,s=a.indexOf(n),r=c[s].value;r!==i&&(o(n),l(r))},p=e=>{let n=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const s=a.indexOf(e.currentTarget)+1;n=a[s]??a[0];break}case"ArrowLeft":{const s=a.indexOf(e.currentTarget)-1;n=a[s]??a[a.length-1];break}}n?.focus()};return(0,f.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,r.A)("tabs",{"tabs--block":s},n),children:c.map((e=>{let{value:n,label:s,attributes:t}=e;return(0,f.jsx)("li",{role:"tab",tabIndex:i===n?0:-1,"aria-selected":i===n,ref:e=>a.push(e),onKeyDown:p,onClick:d,...t,className:(0,r.A)("tabs__item",g.tabItem,t?.className,{"tabs__item--active":i===n}),children:s??n},n)}))})}function y(e){let{lazy:n,children:s,selectedValue:r}=e;const t=(Array.isArray(s)?s:[s]).filter(Boolean);if(n){const e=t.find((e=>e.props.value===r));return e?(0,i.cloneElement)(e,{className:"margin-top--md"}):null}return(0,f.jsx)("div",{className:"margin-top--md",children:t.map(((e,n)=>(0,i.cloneElement)(e,{key:n,hidden:e.props.value!==r})))})}function v(e){const n=j(e);return(0,f.jsxs)("div",{className:(0,r.A)("tabs-container",g.tabList),children:[(0,f.jsx)(b,{...e,...n}),(0,f.jsx)(y,{...e,...n})]})}function w(e){const n=(0,m.A)();return(0,f.jsx)(v,{...e,children:p(e.children)},String(n))}},3023:(e,n,s)=>{s.d(n,{R:()=>l,x:()=>c});var i=s(3696);const r={},t=i.createContext(r);function l(e){const n=i.useContext(t);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),i.createElement(t.Provider,{value:n},e.children)}}}]);