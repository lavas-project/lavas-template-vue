<% routes.forEach(function(route) { %>
let _<%- route.hash %> = () => import('@/<%- route.component %>');
<% }); %>

let routes = [
<% routes.forEach(function(route) { %>
    {
        path: '<%- route.path %>',
        name: '<%- route.name %>',
        component: _<%- route.hash %>
    },
<% }); %>
];

export {routes};