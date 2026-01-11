import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../components/ThemeContext';
import { AuthProvider } from '../../components/AuthContext';

// Custom render with providers
const AllProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock API responses
export const mockApiResponse = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data)
  });
};

// Mock code samples for testing
export const mockCodeSamples = {
  javascript: 'let x = 10;\nconsole.log(x);',
  python: 'x = 10\nprint(x)',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello")\n}',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello");\n  }\n}',
  cpp: '#include <iostream>\nint main() {\n  std::cout << "Hello";\n  return 0;\n}'
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
