"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[6658],{3157:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>a,default:()=>h,frontMatter:()=>s,metadata:()=>r,toc:()=>c});const r=JSON.parse('{"id":"migrating-to-openapi-qraft-v2","title":"Migrating to OpenAPI Qraft v2","description":"In this guide, we\'ll walk through the necessary steps to migrate your project from OpenAPI Qraft v1 to v2.","source":"@site/docs/migrating-to-openapi-qraft-v2.mdx","sourceDirName":".","slug":"/migrating-to-openapi-qraft-v2","permalink":"/openapi-qraft/docs/next/migrating-to-openapi-qraft-v2","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/migrating-to-openapi-qraft-v2.mdx","tags":[],"version":"current","sidebarPosition":150,"frontMatter":{"sidebar_position":150,"sidebar_label":"Migrating to v2"},"sidebar":"mainDocsSidebar","previous":{"title":"setQueryData()","permalink":"/openapi-qraft/docs/next/query-client/setQueryData"}}');var i=t(2540),o=t(3023);const s={sidebar_position:150,sidebar_label:"Migrating to v2"},a="Migrating to OpenAPI Qraft v2",d={},c=[{value:"Key Changes",id:"key-changes",level:2},{value:"1. Removal of <code>QraftContext</code>",id:"1-removal-of-qraftcontext",level:3},{value:"2. Simplified <code>QueryClient</code> Usage",id:"2-simplified-queryclient-usage",level:3},{value:"3. Deprecation and Removal of <code>mutationFn</code> and <code>queryFn</code> Methods",id:"3-deprecation-and-removal-of-mutationfn-and-queryfn-methods",level:3},{value:"4. Error Handling Enhancements",id:"4-error-handling-enhancements",level:3},{value:"5. Updates to <code>qraftAPIClient</code>",id:"5-updates-to-qraftapiclient",level:3},{value:"Migration Steps",id:"migration-steps",level:2},{value:"Automated Migration \ud83e\ude84",id:"automated-migration-",level:2}];function l(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,o.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"migrating-to-openapi-qraft-v2",children:"Migrating to OpenAPI Qraft v2"})}),"\n",(0,i.jsx)(n.p,{children:"In this guide, we'll walk through the necessary steps to migrate your project from OpenAPI Qraft v1 to v2.\nThis migration involves several breaking changes aimed at improving the developer experience and enhancing the library's overall functionality."}),"\n",(0,i.jsx)(n.admonition,{type:"info",children:(0,i.jsxs)(n.p,{children:["Don't miss our automated migration tool using ",(0,i.jsx)(n.a,{href:"#automated-migration-",children:"Codemod \ud83e\ude84"}),",\nwhich can significantly ease the migration process!"]})}),"\n",(0,i.jsx)(n.admonition,{type:"warning",children:(0,i.jsx)(n.p,{children:"This Migration Guide is currently a work in progress \ud83e\uddea"})}),"\n",(0,i.jsx)(n.h2,{id:"key-changes",children:"Key Changes"}),"\n",(0,i.jsxs)(n.h3,{id:"1-removal-of-qraftcontext",children:["1. Removal of ",(0,i.jsx)(n.code,{children:"QraftContext"})]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Change"}),": The ",(0,i.jsx)(n.code,{children:"QraftContext"})," has been removed in favor of an enhanced API design in ",(0,i.jsx)(n.code,{children:"createAPIClient"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Impact"}),": You will now need to pass ",(0,i.jsx)(n.code,{children:"baseUrl"})," and ",(0,i.jsx)(n.code,{children:"queryClient"})," directly to the ",(0,i.jsx)(n.code,{children:"createAPIClient"})," function.\nThis change ensures that your API client is always configured consistently across your project."]}),"\n"]}),"\n",(0,i.jsxs)(n.h3,{id:"2-simplified-queryclient-usage",children:["2. Simplified ",(0,i.jsx)(n.code,{children:"QueryClient"})," Usage"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Change"}),": The option to pass a ",(0,i.jsx)(n.code,{children:"QueryClient"})," for hooks or methods has been removed."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Impact"}),": There is now a single ",(0,i.jsx)(n.code,{children:"QueryClient"})," instance associated with ",(0,i.jsx)(n.code,{children:"createAPIClient"}),", which simplifies\nthe API and reduces potential errors. Update your hooks and methods to rely on this single instance."]}),"\n"]}),"\n",(0,i.jsxs)(n.h3,{id:"3-deprecation-and-removal-of-mutationfn-and-queryfn-methods",children:["3. Deprecation and Removal of ",(0,i.jsx)(n.code,{children:"mutationFn"})," and ",(0,i.jsx)(n.code,{children:"queryFn"})," Methods"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Change"}),": The deprecated ",(0,i.jsx)(n.code,{children:"mutationFn"})," and ",(0,i.jsx)(n.code,{children:"queryFn"})," methods have been removed."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Impact"}),": Refactor your code to use the new API methods that align with the updated approach in v2."]}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"4-error-handling-enhancements",children:"4. Error Handling Enhancements"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Change"}),": The ",(0,i.jsx)(n.code,{children:"requestFn"})," now returns ",(0,i.jsx)(n.code,{children:"{ data, error, response }"})," instead of ",(0,i.jsx)(n.code,{children:"Promise.resolve(...) | Promise.reject(error)"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Impact"}),": This change promotes stricter error handling within your application. Ensure your error handling logic is updated to accommodate this new structure."]}),"\n"]}),"\n",(0,i.jsxs)(n.h3,{id:"5-updates-to-qraftapiclient",children:["5. Updates to ",(0,i.jsx)(n.code,{children:"qraftAPIClient"})]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Change"}),": The ",(0,i.jsx)(n.code,{children:"qraftAPIClient(...)"})," now returns only the set of services corresponding to the methods for which callbacks were passed."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Impact"}),": Review and update your service definitions to match this new behavior."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"migration-steps",children:"Migration Steps"}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsxs)(n.strong,{children:["Remove ",(0,i.jsx)(n.code,{children:"QraftContext"})]}),": Refactor all instances where ",(0,i.jsx)(n.code,{children:"QraftContext"})," was used, and pass the required parameters directly to ",(0,i.jsx)(n.code,{children:"createAPIClient"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Update Hooks and Methods"}),": Ensure that all hooks and methods are not using ",(0,i.jsx)(n.code,{children:"QueryClient"})," and are now using the single ",(0,i.jsx)(n.code,{children:"queryClient"})," instance."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Refactor Deprecated Methods"}),": Search for any usage of ",(0,i.jsx)(n.code,{children:"mutationFn"})," and ",(0,i.jsx)(n.code,{children:"queryFn"}),", and replace them with the appropriate new methods,\nsee core ",(0,i.jsx)(n.a,{href:"/openapi-qraft/docs/next/core/query-operation",children:"Query"})," and ",(0,i.jsx)(n.a,{href:"/openapi-qraft/docs/next/core/mutation-operation",children:"Mutation"})," methods."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Revise Error Handling"}),": Adjust your error handling logic to work with the new ",(0,i.jsx)(n.code,{children:"{ data, error, response }"})," structure returned by ",(0,i.jsx)(n.code,{children:"requestFn"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Review Service Definitions"}),": Double-check your service definitions and ensure they align with the updated return structure of ",(0,i.jsx)(n.code,{children:"qraftAPIClient(...)"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Test and Validate"}),": Thoroughly test your application to ensure that all changes have been correctly implemented and that no regressions have been introduced."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"automated-migration-",children:"Automated Migration \ud83e\ude84"}),"\n",(0,i.jsxs)(n.p,{children:["To assist with the migration process, we've provided a Codemod script using ",(0,i.jsx)(n.a,{href:"https://github.com/facebook/jscodeshift",children:(0,i.jsx)(n.code,{children:"jscodeshift"})}),".\nYou can run this script to automatically update most of the breaking changes in your codebase."]}),"\n",(0,i.jsx)(n.p,{children:"To use the migration script, run the following command in your project root:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"npx jscodeshift@latest --extensions=tsx,ts --parser=tsx -t https://raw.githubusercontent.com/OpenAPI-Qraft/openapi-qraft/main/packages/react-client/src/migrate-to-v2-codemod.ts ./src/\n"})}),"\n",(0,i.jsxs)(n.p,{children:["This command will apply the migration transformations to all ",(0,i.jsx)(n.code,{children:".tsx"})," and ",(0,i.jsx)(n.code,{children:".ts"})," files in your ",(0,i.jsx)(n.code,{children:"src"})," directory.\nAfter running the script, make sure to review the changes and manually adjust where necessary."]}),"\n",(0,i.jsx)(n.p,{children:"By following these steps and using the automated migration script, you should be able to smoothly transition your project\nto OpenAPI Qraft v2 while taking advantage of the new features and improvements."})]})}function h(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(l,{...e})}):l(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>s,x:()=>a});var r=t(3696);const i={},o=r.createContext(i);function s(e){const n=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:s(e.components),r.createElement(o.Provider,{value:n},e.children)}}}]);