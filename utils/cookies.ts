import Cookies from 'js-cookie'

const AUTH_COOKIE_NAME = 'auth_token'
const COOKIE_EXPIRATION = 30 // days

export const setAuthCookie = (token: string) => {
  Cookies.set(AUTH_COOKIE_NAME, token, { expires: COOKIE_EXPIRATION })
}

export const getAuthCookie = () => {
  return Cookies.get(AUTH_COOKIE_NAME)
}

export const removeAuthCookie = () => {
  Cookies.remove(AUTH_COOKIE_NAME)
}

