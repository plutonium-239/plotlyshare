const makeHeaders = () => {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(c => c.startsWith('__Session-worker.auth.providers-token='));
    console.log(tokenCookie);
    return {
        'Authorization': `Bearer ${tokenCookie}`
    }
}