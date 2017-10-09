import Vue from 'vue';
import Router from 'vue-router';
<% router.routes.forEach(function(route) { %>
    <% if (route.lazyLoading) { %>
let _<%- route.hash %> = () => import(<% if (route.chunkname) { %>/* webpackChunkName: "<%- route.chunkname %>" */ <% } %>'@/<%- route.component %>');
    <% } else { %>
import _<%- route.hash %> from '@/<%- route.component %>';
    <% } %>
<% }); %>

let routes = [
    <%= routesContent %>
];

Vue.use(Router);

export function createRouter() {
    return new Router({
        mode: '<%- router.mode %>',
        base: '<%- router.base %>',
        routes
    });
}
