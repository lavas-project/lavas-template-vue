export default function ({ store, redirect }) {
    console.log('bbb');
    if (store.getters.isAuthenticated) {
        console.log('bbb1');
        return redirect('/detail/2');
        // store.state.user = 1;
    }
}
