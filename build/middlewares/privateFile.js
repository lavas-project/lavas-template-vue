export default function (files) {
    return async function (ctx, next) {
        console.log(ctx.path)
        if (files.find(file => ctx.path.indexOf(file) > -1)) {
            ctx.throw(404);
        }
        await next();
    };
}
