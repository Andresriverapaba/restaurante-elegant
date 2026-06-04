module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Esto le dice a Jest: "Si ves un archivo CSS, usa identity-obj-proxy en su lugar"
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    // Esto asegura que Babel siga transformando tus archivos .jsx
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};