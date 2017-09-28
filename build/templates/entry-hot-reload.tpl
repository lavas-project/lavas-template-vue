import 'eventsource-polyfill';
import hotClient from 'webpack-hot-middleware/client?name=<%- compilerName %>&noInfo=false&reload=true';

<% if (subscribeReload) { %>
    hotClient.subscribe(payload => {
        if (payload.action === 'reload' || payload.reload === true) {
            window.location.reload();
        }
    });
<% } %>
