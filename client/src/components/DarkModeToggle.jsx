import { useTheme } from './ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const DarkModeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                padding: '6px 12px',
                marginRight: '10px',
                cursor: 'pointer',
                borderRadius: '50%',
                border: '1px solid gray',
                background: isDark ? '#333' : '#eee',
                color: isDark ? '#fff' : '#000',
                fontSize: '18px',
                transition: 'all 0.3s ease',
            }}
            aria-label="Toggle Dark Mode"
        >
            {isDark ? <FaSun /> : <FaMoon />}
        </button>
    );
};

export default DarkModeToggle;
