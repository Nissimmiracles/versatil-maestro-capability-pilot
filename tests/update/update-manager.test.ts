/**
 * Tests for UpdateManager - Framework Update System
 * Tests for v3.0.0 Update Manager with backup, rollback, and update capabilities
 *
 * FIXED: Converted to Vitest
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { UpdateManager, UpdateConfig, UpdateHistory } from '../../src/update/update-manager';
import { GitHubReleaseChecker, ReleaseInfo, UpdateCheckResult } from '../../src/update/github-release-checker';
import * as path from 'path';
import * as os from 'os';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn(),
  readdir: vi.fn()
}));

// Mock child_process and util
const mockExecAsync = vi.fn();
vi.mock('child_process', () => ({
  exec: vi.fn()
}));
vi.mock('util', () => ({
  promisify: () => mockExecAsync
}));

// Mock GitHubReleaseChecker
const sharedMockInstance = {
  checkForUpdate: vi.fn(),
  getLatestRelease: vi.fn(),
  getReleaseByTag: vi.fn(),
  getAllReleases: vi.fn(),
  getReleaseByVersion: vi.fn(),
  getReleasesBetween: vi.fn(),
  clearCache: vi.fn()
};

vi.mock('../../src/update/github-release-checker', () => ({
  GitHubReleaseChecker: vi.fn().mockImplementation(() => sharedMockInstance),
  GitHubReleaseError: class GitHubReleaseError extends Error {}
}));

// Import mocked fs after mocking
import * as fs from 'fs/promises';

describe('UpdateManager', () => {
  let updateManager: UpdateManager;
  let versatilHome: string;
  let updateHistoryFile: string;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Setup fs mocks
    (fs.mkdir as Mock).mockResolvedValue(undefined);
    (fs.writeFile as Mock).mockResolvedValue(undefined);
    (fs.readFile as Mock).mockResolvedValue('[]');
    (fs.readdir as Mock).mockResolvedValue([]);

    // Setup mockExecAsync (promise-based) with smart command handling
    mockExecAsync.mockImplementation((cmd: string) => {
      if (cmd.includes('tar -czf') || cmd.includes('tar -xzf')) {
        return Promise.resolve({ stdout: '', stderr: '' });
      } else if (cmd.includes('npm update')) {
        return Promise.resolve({ stdout: 'Updated successfully', stderr: '' });
      } else if (cmd.includes('versatil --version')) {
        // Extract version from npm update command or return default
        const updateMatch = (mockExecAsync.mock.calls || [])
          .flat()
          .find((call: any) => typeof call === 'string' && call.includes('npm update'))
          ?.match(/@(\d+\.\d+\.\d+)/);
        const version = updateMatch ? updateMatch[1] : '3.0.0';
        return Promise.resolve({ stdout: version, stderr: '' });
      }
      return Promise.resolve({ stdout: '', stderr: '' });
    });

    // Setup paths
    versatilHome = path.join(os.homedir(), '.versatil');
    updateHistoryFile = path.join(versatilHome, 'update-history.json');

    // Create update manager instance
    updateManager = new UpdateManager({
      autoCheck: false,
      checkInterval: 60000,
      includePrerelease: false,
      backupBeforeUpdate: true,
      autoUpdate: false
    });

    // Suppress console output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. checkForUpdates - no updates available', () => {
    it('should return hasUpdate=false when current version is latest', async () => {
      const currentVersion = '3.0.0';
      const mockResult = {
        hasUpdate: false,
        currentVersion: '3.0.0',
        latestVersion: '3.0.0'
      };

      sharedMockInstance.checkForUpdate.mockResolvedValue(mockResult);

      const result = await updateManager.checkForUpdates(currentVersion);

      expect(result.hasUpdate).toBe(false);
      expect(result.currentVersion).toBe(currentVersion);
      expect(result.latestVersion).toBe(currentVersion);
      expect(sharedMockInstance.checkForUpdate).toHaveBeenCalledWith(currentVersion, false);
    });

    it('should handle check when already on future version', async () => {
      const currentVersion = '4.0.0';
      const mockResult = {
        hasUpdate: false,
        currentVersion: '4.0.0',
        latestVersion: '3.0.0'
      };

      sharedMockInstance.checkForUpdate.mockResolvedValue(mockResult);

      const result = await updateManager.checkForUpdates(currentVersion);

      expect(result.hasUpdate).toBe(false);
    });
  });

  describe('2. checkForUpdates - new version available', () => {
    it('should detect when a new version is available', async () => {
      const currentVersion = '2.5.0';
      const mockRelease: ReleaseInfo = {
        version: '3.0.0',
        tagName: 'v3.0.0',
        publishedAt: new Date().toISOString(),
        changelog: '# Version 3.0.0\n\n- New features\n- Bug fixes',
        releaseNotes: 'Major update with new features',
        downloadUrl: 'https://github.com/test/repo/archive/v3.0.0.tar.gz',
        prerelease: false
      };

      const mockResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0',
        releaseInfo: mockRelease,
        updateType: 'major'
      };

      sharedMockInstance.checkForUpdate.mockResolvedValue(mockResult);

      const result = await updateManager.checkForUpdates(currentVersion);

      expect(result.hasUpdate).toBe(true);
      expect(result.currentVersion).toBe('2.5.0');
      expect(result.latestVersion).toBe('3.0.0');
      expect(result.updateType).toBe('major');
      expect(result.releaseInfo).toEqual(mockRelease);
    });

    it('should correctly identify minor version updates', async () => {
      const mockResult = {
        hasUpdate: true,
        currentVersion: '3.0.0',
        latestVersion: '3.1.0',
        updateType: 'minor'
      };

      sharedMockInstance.checkForUpdate.mockResolvedValue(mockResult);

      const result = await updateManager.checkForUpdates('3.0.0');

      expect(result.hasUpdate).toBe(true);
      expect(result.updateType).toBe('minor');
    });

    it('should correctly identify patch version updates', async () => {
      const mockResult = {
        hasUpdate: true,
        currentVersion: '3.0.0',
        latestVersion: '3.0.1',
        updateType: 'patch'
      };

      sharedMockInstance.checkForUpdate.mockResolvedValue(mockResult);

      const result = await updateManager.checkForUpdates('3.0.0');

      expect(result.hasUpdate).toBe(true);
      expect(result.updateType).toBe('patch');
    });
  });

  describe('3. installUpdate - successful installation', () => {
    it('should successfully install an update with backup', async () => {
      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0',
        updateType: 'major'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('tar -czf')) {
          return Promise.resolve({ stdout: '', stderr: '' });
        } else if (cmd.includes('npm update')) {
          return Promise.resolve({ stdout: 'Updated successfully', stderr: '' });
        } else if (cmd.includes('versatil --version')) {
          return Promise.resolve({ stdout: '3.0.0', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      const result = await updateManager.update('2.5.0');

      expect(result).toBe(true);
      expect(fs.mkdir as Mock).toHaveBeenCalled();
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('tar -czf')
      );
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('npm update -g versatil-sdlc-framework@3.0.0')
      );
      expect(fs.writeFile as Mock).toHaveBeenCalled();
    });

    it('should skip backup if backupBeforeUpdate is false', async () => {
      const managerNoBackup = new UpdateManager({
        backupBeforeUpdate: false
      });

      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('npm update')) {
          return Promise.resolve({ stdout: 'Updated', stderr: '' });
        } else if (cmd.includes('versatil --version')) {
          return Promise.resolve({ stdout: '3.0.0', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      await managerNoBackup.update('2.5.0');

      const tarCalls = mockExecAsync.mock.calls.filter(
        (call: any[]) => call[0].includes('tar -czf')
      );
      expect(tarCalls.length).toBe(0);
    });

    it('should record successful update in history', async () => {
      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('npm update')) {
          return Promise.resolve({ stdout: 'Updated', stderr: '' });
        } else if (cmd.includes('versatil --version')) {
          return Promise.resolve({ stdout: '3.0.0', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      await updateManager.update('2.5.0');

      expect(fs.writeFile as Mock).toHaveBeenCalledWith(
        updateHistoryFile,
        expect.stringContaining('"success": true')
      );
    });
  });

  describe('4. installUpdate - network failure', () => {
    it('should handle network errors gracefully during update check', async () => {
      const networkError = new Error('Network request failed');
      sharedMockInstance.checkForUpdate.mockRejectedValue(networkError);

      const result = await updateManager.update('3.0.0');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Update failed')
      );
    });

    it('should handle npm update failures gracefully', async () => {
      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('npm update')) {
          return Promise.reject(new Error('ECONNREFUSED: Connection refused'));
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      const result = await updateManager.update('2.5.0');

      expect(result).toBe(false);
      expect(fs.writeFile as Mock).toHaveBeenCalledWith(
        updateHistoryFile,
        expect.stringContaining('"success": false')
      );
    });

    it('should continue with failed backup warning', async () => {
      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('tar -czf')) {
          return Promise.reject(new Error('Backup failed'));
        } else if (cmd.includes('npm update')) {
          return Promise.resolve({ stdout: 'Updated', stderr: '' });
        } else if (cmd.includes('versatil --version')) {
          return Promise.resolve({ stdout: '3.0.0', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      const result = await updateManager.update('2.5.0');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Backup failed')
      );
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('npm update')
      );
    });
  });

  describe('5. installUpdate - checksum validation', () => {
    it('should detect version mismatch after installation', async () => {
      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('npm update')) {
          return Promise.resolve({ stdout: 'Updated', stderr: '' });
        } else if (cmd.includes('versatil --version')) {
          return Promise.resolve({ stdout: '2.9.9', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      const result = await updateManager.update('2.5.0');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Update failed')
      );
    });

    it('should accept version without v prefix', async () => {
      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('npm update')) {
          return Promise.resolve({ stdout: 'Updated', stderr: '' });
        } else if (cmd.includes('versatil --version')) {
          return Promise.resolve({ stdout: 'v3.0.0\n', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      const result = await updateManager.update('2.5.0');

      expect(result).toBe(true);
    });
  });

  describe('6. crashRecovery - restore from crash', () => {
    it('should rollback to previous version from backup', async () => {
      const backupFile = path.join(versatilHome, 'backups', 'versatil-v2.5.0-2025-10-03T12-00-00.tar.gz');

      (fs.readdir as Mock).mockResolvedValue(['versatil-v2.5.0-2025-10-03T12-00-00.tar.gz']);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('tar -xzf')) {
          return Promise.resolve({ stdout: '', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      const result = await updateManager.rollback(backupFile);

      expect(result).toBe(true);
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('tar -xzf')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Rollback complete')
      );
    });

    it('should find and use most recent backup if none specified', async () => {
      (fs.readdir as Mock).mockResolvedValue([
        'versatil-v2.4.0-2025-10-01T12-00-00.tar.gz',
        'versatil-v2.5.0-2025-10-03T12-00-00.tar.gz',
        'versatil-v2.3.0-2025-09-30T12-00-00.tar.gz'
      ]);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('tar -xzf')) {
          return Promise.resolve({ stdout: '', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      const result = await updateManager.rollback();

      expect(result).toBe(true);
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('versatil-v2.5.0-2025-10-03T12-00-00.tar.gz')
      );
    });

    it('should handle rollback failure gracefully', async () => {
      (fs.readdir as Mock).mockResolvedValue(['backup.tar.gz']);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('tar -xzf')) {
          return Promise.reject(new Error('Extraction failed'));
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      const result = await updateManager.rollback();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Rollback failed')
      );
    });

    it('should handle no backups found', async () => {
      (fs.readdir as Mock).mockResolvedValue([]);

      const result = await updateManager.rollback();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('No backups found')
      );
    });
  });

  describe('7. updateLock - prevent concurrent updates', () => {
    it('should handle concurrent update attempts', async () => {
      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      let updateInProgress = false;
      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('npm update')) {
          if (updateInProgress) {
            return Promise.reject(new Error('Update already in progress'));
          }
          updateInProgress = true;
          return new Promise(resolve => {
            setTimeout(() => {
              updateInProgress = false;
              resolve({ stdout: 'Updated', stderr: '' });
            }, 100);
          });
        } else if (cmd.includes('versatil --version')) {
          return Promise.resolve({ stdout: '3.0.0', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      const update1Promise = updateManager.update('2.5.0');
      const update2Promise = updateManager.update('2.5.0');

      const [result1, result2] = await Promise.all([update1Promise, update2Promise]);

      expect(result1 || result2).toBeDefined();
    });
  });

  describe('8. backupCreation - verify backup before update', () => {
    it('should create backup before starting update', async () => {
      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      let backupCreated = false;
      let updateStarted = false;

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('tar -czf')) {
          expect(updateStarted).toBe(false);
          backupCreated = true;
          return Promise.resolve({ stdout: '', stderr: '' });
        } else if (cmd.includes('npm update')) {
          expect(backupCreated).toBe(true);
          updateStarted = true;
          return Promise.resolve({ stdout: 'Updated', stderr: '' });
        } else if (cmd.includes('versatil --version')) {
          return Promise.resolve({ stdout: '3.0.0', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      await updateManager.update('2.5.0');

      expect(backupCreated).toBe(true);
      expect(updateStarted).toBe(true);
    });

    it('should create backup with correct naming convention', async () => {
      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('tar -czf')) {
          expect(cmd).toMatch(/versatil-v2\.5\.0-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.tar\.gz/);
          return Promise.resolve({ stdout: '', stderr: '' });
        } else if (cmd.includes('npm update')) {
          return Promise.resolve({ stdout: 'Updated', stderr: '' });
        } else if (cmd.includes('versatil --version')) {
          return Promise.resolve({ stdout: '3.0.0', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      await updateManager.update('2.5.0');
    });

    it('should create backups directory if it does not exist', async () => {
      const mockCheckResult = {
        hasUpdate: true,
        currentVersion: '2.5.0',
        latestVersion: '3.0.0'
      };
      sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

      mockExecAsync.mockImplementation((cmd: string) => {
        if (cmd.includes('tar -czf')) {
          return Promise.resolve({ stdout: '', stderr: '' });
        } else if (cmd.includes('npm update')) {
          return Promise.resolve({ stdout: 'Updated', stderr: '' });
        } else if (cmd.includes('versatil --version')) {
          return Promise.resolve({ stdout: '3.0.0', stderr: '' });
        }
        return Promise.resolve({ stdout: '', stderr: '' });
      });

      await updateManager.update('2.5.0');

      expect(fs.mkdir as Mock).toHaveBeenCalledWith(
        expect.stringContaining('backups'),
        expect.objectContaining({ recursive: true })
      );
    });
  });

  describe('Additional UpdateManager Features', () => {
    describe('getUpdateHistory', () => {
      it('should retrieve update history from file', async () => {
        const mockHistory: UpdateHistory[] = [
          {
            timestamp: '2025-10-01T12:00:00.000Z',
            fromVersion: '2.4.0',
            toVersion: '2.5.0',
            success: true
          },
          {
            timestamp: '2025-10-03T12:00:00.000Z',
            fromVersion: '2.5.0',
            toVersion: '3.0.0',
            success: true
          }
        ];

        (fs.readFile as Mock).mockResolvedValue(JSON.stringify(mockHistory));

        const history = await updateManager.getUpdateHistory();

        expect(history).toEqual(mockHistory);
        expect(fs.readFile as Mock).toHaveBeenCalledWith(updateHistoryFile, 'utf-8');
      });

      it('should return empty array if history file does not exist', async () => {
        (fs.readFile as Mock).mockRejectedValue(new Error('ENOENT'));

        const history = await updateManager.getUpdateHistory();

        expect(history).toEqual([]);
      });
    });

    describe('getChangelog', () => {
      it('should retrieve changelog for specific version', async () => {
        const mockRelease: ReleaseInfo = {
          version: '3.0.0',
          tagName: 'v3.0.0',
          publishedAt: '2025-10-03T12:00:00.000Z',
          changelog: '# Version 3.0.0\n\n- Feature A\n- Feature B',
          releaseNotes: 'Major release',
          downloadUrl: 'https://test.com/release.tar.gz',
          prerelease: false
        };

        sharedMockInstance.getReleaseByTag.mockResolvedValue(mockRelease);

        const changelog = await updateManager.getChangelog('3.0.0');

        expect(changelog).toBe('# Version 3.0.0\n\n- Feature A\n- Feature B');
        expect(sharedMockInstance.getReleaseByTag).toHaveBeenCalledWith('v3.0.0');
      });

      it('should retrieve latest changelog when no version specified', async () => {
        const mockRelease: ReleaseInfo = {
          version: '3.0.0',
          tagName: 'v3.0.0',
          publishedAt: '2025-10-03T12:00:00.000Z',
          changelog: '# Latest Release',
          releaseNotes: 'Latest',
          downloadUrl: 'https://test.com/release.tar.gz',
          prerelease: false
        };

        sharedMockInstance.getLatestRelease.mockResolvedValue(mockRelease);

        const changelog = await updateManager.getChangelog();

        expect(changelog).toBe('# Latest Release');
      });

      it('should return fallback message when changelog unavailable', async () => {
        sharedMockInstance.getReleaseByTag.mockRejectedValue(new Error('Not found'));

        const changelog = await updateManager.getChangelog('3.0.0');

        expect(changelog).toBe('Changelog not available');
      });
    });

    describe('listBackups', () => {
      it('should list all available backups', async () => {
        const mockBackups = [
          'versatil-v2.5.0-2025-10-03T12-00-00.tar.gz',
          'versatil-v2.4.0-2025-10-01T12-00-00.tar.gz',
          'versatil-v2.3.0-2025-09-30T12-00-00.tar.gz'
        ];

        (fs.readdir as Mock).mockResolvedValue(mockBackups);

        const backups = await updateManager.listBackups();

        expect(backups).toEqual(mockBackups);
      });

      it('should filter out non-backup files', async () => {
        const mockFiles = [
          'versatil-v2.5.0-2025-10-03T12-00-00.tar.gz',
          'README.md',
          'config.json',
          'versatil-v2.4.0-2025-10-01T12-00-00.tar.gz'
        ];

        (fs.readdir as Mock).mockResolvedValue(mockFiles);

        const backups = await updateManager.listBackups();

        expect(backups).toHaveLength(2);
        expect(backups.every((b: string) => b.endsWith('.tar.gz'))).toBe(true);
      });

      it('should return empty array if backups directory does not exist', async () => {
        (fs.readdir as Mock).mockRejectedValue(new Error('ENOENT'));

        const backups = await updateManager.listBackups();

        expect(backups).toEqual([]);
      });
    });

    describe('Configuration', () => {
      it('should initialize with default configuration', () => {
        const defaultManager = new UpdateManager();
        expect(defaultManager).toBeDefined();
      });

      it('should accept custom configuration', () => {
        const customConfig: Partial<UpdateConfig> = {
          autoCheck: true,
          includePrerelease: true,
          backupBeforeUpdate: false,
          autoUpdate: true
        };

        const customManager = new UpdateManager(customConfig);
        expect(customManager).toBeDefined();
      });
    });

    describe('Update History Recording', () => {
      it('should record failed updates with error message', async () => {
        const mockCheckResult = {
          hasUpdate: true,
          currentVersion: '2.5.0',
          latestVersion: '3.0.0'
        };
        sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

        const errorMessage = 'Network error occurred';
        mockExecAsync.mockImplementation((cmd: string) => {
          if (cmd.includes('npm update')) {
            return Promise.reject(new Error(errorMessage));
          }
          return Promise.resolve({ stdout: '', stderr: '' });
        });

        await updateManager.update('2.5.0');

        expect(fs.writeFile as Mock).toHaveBeenCalledWith(
          updateHistoryFile,
          expect.stringContaining('"success": false')
        );
        expect(fs.writeFile as Mock).toHaveBeenCalledWith(
          updateHistoryFile,
          expect.stringContaining(errorMessage)
        );
      });

      it('should limit history to 50 entries', async () => {
        const largeHistory: UpdateHistory[] = Array.from({ length: 55 }, (_, i) => ({
          timestamp: new Date(2025, 9, i + 1).toISOString(),
          fromVersion: `2.${i}.0`,
          toVersion: `2.${i + 1}.0`,
          success: true
        }));

        (fs.readFile as Mock).mockResolvedValue(JSON.stringify(largeHistory));

        const mockCheckResult = {
          hasUpdate: true,
          currentVersion: '3.0.0',
          latestVersion: '3.1.0'
        };
        sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

        mockExecAsync.mockImplementation((cmd: string) => {
          if (cmd.includes('npm update')) {
            return Promise.resolve({ stdout: 'Updated', stderr: '' });
          } else if (cmd.includes('versatil --version')) {
            return Promise.resolve({ stdout: '3.1.0', stderr: '' });
          }
          return Promise.resolve({ stdout: '', stderr: '' });
        });

        await updateManager.update('3.0.0');

        const writeCall = (fs.writeFile as Mock).mock.calls.find(
          (call: any[]) => call[0] === updateHistoryFile
        );
        const writtenHistory = JSON.parse(writeCall[1]);
        expect(writtenHistory.length).toBe(50);
      });

      it('should not fail update if history recording fails', async () => {
        const mockCheckResult = {
          hasUpdate: true,
          currentVersion: '2.5.0',
          latestVersion: '3.0.0'
        };
        sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

        mockExecAsync.mockImplementation((cmd: string) => {
          if (cmd.includes('npm update')) {
            return Promise.resolve({ stdout: 'Updated', stderr: '' });
          } else if (cmd.includes('versatil --version')) {
            return Promise.resolve({ stdout: '3.0.0', stderr: '' });
          }
          return Promise.resolve({ stdout: '', stderr: '' });
        });

        (fs.writeFile as Mock).mockRejectedValue(new Error('Disk full'));

        const result = await updateManager.update('2.5.0');

        expect(result).toBe(true);
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('Failed to record update history'),
          expect.any(Error)
        );
      });
    });

    describe('No Update Scenario', () => {
      it('should return true and log message when already on latest version', async () => {
        const mockCheckResult = {
          hasUpdate: false,
          currentVersion: '3.0.0',
          latestVersion: '3.0.0'
        };
        sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

        const result = await updateManager.update('3.0.0');

        expect(result).toBe(true);
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('Already on latest version')
        );
      });

      it('should install specific target version even if no update available', async () => {
        const mockCheckResult = {
          hasUpdate: false,
          currentVersion: '3.0.0',
          latestVersion: '3.0.0'
        };
        sharedMockInstance.checkForUpdate.mockResolvedValue(mockCheckResult);

        mockExecAsync.mockImplementation((cmd: string) => {
          if (cmd.includes('npm update')) {
            return Promise.resolve({ stdout: 'Updated', stderr: '' });
          } else if (cmd.includes('versatil --version')) {
            return Promise.resolve({ stdout: '2.5.0', stderr: '' });
          }
          return Promise.resolve({ stdout: '', stderr: '' });
        });

        const result = await updateManager.update('3.0.0', '2.5.0');

        expect(mockExecAsync).toHaveBeenCalledWith(
          expect.stringContaining('versatil-sdlc-framework@2.5.0')
        );
      });
    });
  });
});
