import { 
  addSnippet, 
  getSnippets, 
  removeSnippet,
  incrementStat,
  getStats,
  touchLastActive
} from '../../services/localStore';

describe('LocalStore Service', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.getItem.mockReturnValue(null);
  });

  describe('Snippets', () => {
    it('should add a snippet', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]));
      
      const snippet = { title: 'Test', language: 'javascript', code: 'console.log("hi")' };
      addSnippet(snippet);
      
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should get snippets', () => {
      const mockSnippets = [{ id: 1, title: 'Test' }];
      localStorage.getItem.mockReturnValue(JSON.stringify(mockSnippets));
      
      const result = getSnippets();
      
      expect(result).toEqual(mockSnippets);
    });

    it('should return empty array when no snippets', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = getSnippets();
      
      expect(result).toEqual([]);
    });

    it('should remove a snippet', () => {
      const mockSnippets = [
        { id: '1', title: 'Test1' },
        { id: '2', title: 'Test2' }
      ];
      localStorage.getItem.mockReturnValue(JSON.stringify(mockSnippets));
      
      removeSnippet('1');
      
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Stats', () => {
    it('should increment a stat', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({ runs: 5 }));
      
      incrementStat('runs', 1);
      
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should get stats', () => {
      const mockStats = { runs: 10, visualizes: 5 };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockStats));
      
      const result = getStats();
      
      expect(result).toEqual(mockStats);
    });

    it('should return default stats when none exist', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = getStats();
      
      expect(result).toEqual({});
    });
  });

  describe('Last Active', () => {
    it('should update last active timestamp', () => {
      touchLastActive();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lastActive',
        expect.any(String)
      );
    });
  });
});
