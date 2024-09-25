---
'@openapi-qraft/tanstack-query-react-plugin': patch
'@openapi-qraft/tanstack-query-react-types': patch
'@openapi-qraft/react': patch
---

Implemented support for requests with multiple media types. Now, if an endpoint accepts more than one media type (e.g., JSON and form-data), types will be generated to account for all possible cases, ensuring compatibility with both JSON and form-data input formats.
