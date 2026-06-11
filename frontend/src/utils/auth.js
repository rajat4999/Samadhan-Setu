export const getRoleFromToken = (token) => {
  try {
    // 1. Get the payload part of the token (the middle string)
    const base64Url = token.split('.')[1];
    
    // 2. Decode Base64 to a JSON string
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    // 3. Parse JSON and return the role
    const decoded = JSON.parse(jsonPayload);
    return decoded.role; // returns 'student' or 'caretaker'
  } catch (error) {
    return null;
  }
};