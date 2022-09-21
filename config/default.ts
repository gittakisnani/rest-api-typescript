export default {
    port: 1337,
    DATABASE_URI: '',
    origin: 'http://localhost:3000',  
    salt: 10,
    accessTokenTtl: '15m',
    refreshTokenTtl: '1y',
    privateKey: ``,
    publicKey:`-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgFTQLDHxErNm5Ji1wa2PHRorEHGw
uSricDBGrdCH4+GpmMotixD5uQHOXACZl9YMfQcIx3fabqpNtbKrlq1nnjixtnzn
FWVflT4EZbOtgwEd5FwP9Mr6mo/getMHBW+Estgw04oJfE6DOpOqLODU0F/9vStj
G7USvB3dUzubvoTjAgMBAAE=
-----END PUBLIC KEY-----`,
    clientId: '',
    secret: "",
    redirectUri: '',
    githubClientId: '',
    githubSecret: '',
    githubCallbackUrl: '',
    cookieName: ''
}