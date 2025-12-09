const {
  CognitoUserPool,
  CognitoUser,
} = require('amazon-cognito-identity-js')
const config = require('./client_config.json')

const poolData = {
  UserPoolId: config.POOL_DATA.USER_POOL_ID,
  ClientId: config.POOL_DATA.CLIENT_ID,
}

const userPool = new CognitoUserPool(poolData)

function logoutUser(email) {
  if (!email) {
    return Promise.reject(new Error('Email is required to log out.'))
  }

  const user = new CognitoUser({ Username: email, Pool: userPool })

  return new Promise((resolve, reject) => {
    try {
      user.signOut()
      console.log('User signed out successfully')
      resolve()
    } catch (err) {
      console.error('Logout failed:', err)
      reject(err)
    }
  })
}

// example usage:
logoutUser(config.ADMIN.ADMIN_USER)
  .then(() => console.log('Logout complete'))
  .catch(console.error)
