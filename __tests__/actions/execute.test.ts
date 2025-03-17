import { describe, expect, it, vi, beforeEach } from 'vitest';
import { executeAction } from '../../src/actions/execute';
import { composeContext, generateMessageResponse, generateTrueOrFalse, ModelClass } from '@elizaos/core';

vi.mock('@elizaos/core', () => ({
    composeContext: vi.fn(),
    generateMessageResponse: vi.fn(),
    generateTrueOrFalse: vi.fn(),
    elizaLogger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        log: vi.fn()
    },
    messageCompletionFooter: '\nResponse format:\n```\n{"content": {"text": string}}\n```',
    booleanFooter: '\nResponse format: YES or NO',
    ModelClass: {
        SMALL: 'small',
        LARGE: 'large'
    }
}));

describe('executeAction', () => {
    let mockRuntime;
    let mockMessage;
    let mockState;
    let mockCallback;

    beforeEach(() => {
        mockRuntime = {
            character: {
                settings: {},
                name: 'TestBot',
                bio: 'A test bot',
                lore: 'Test lore',
                knowledge: 'Test knowledge',
                templates: {
                    messageHandlerTemplate: 'Test template {{agentName}}'
                }
            },
            messageManager: {
                getLastMessageInRoom: vi.fn().mockResolvedValue({
                    userId: 'test-user',
                    content: { text: 'Execute this code: console.log("hello")' }
                }),
                getMemories: vi.fn().mockResolvedValue([])
            },
            composeState: vi.fn().mockResolvedValue({
                agentId: 'test-agent',
                roomId: 'test-room'
            }),
            updateRecentMessageState: vi.fn().mockImplementation(state => Promise.resolve({
                ...state,
                recentMessagesData: []
            })),
            agentId: 'test-agent',
            databaseAdapter: {
                log: vi.fn().mockResolvedValue(true)
            }
        };

        mockMessage = {
            id: 'test-message-1',
            content: {
                text: 'Execute this code: console.log("hello")'
            },
            roomId: 'test-room',
            userId: 'test-user',
            createdAt: Date.now()
        };

        mockState = {
            agentId: 'test-agent',
            roomId: 'test-room',
            recentMessagesData: []
        };

        mockCallback = vi.fn();

        // Reset all mocks
        vi.clearAllMocks();
    });

    describe('validation', () => {
        it('should validate successfully when keywords are present', async () => {
            mockMessage.content.text = 'Run this function on bless network';
            
            const result = await executeAction.validate(mockRuntime, mockMessage);
            expect(result).toBe(true);
        });

        it('should fail validation when no bless keywords are present', async () => {
            mockMessage.content.text = 'Just a regular message';
            
            const result = await executeAction.validate(mockRuntime, mockMessage);
            expect(result).toBe(false);
        });
    });

    describe('action properties', () => {
        it('should have correct action properties', () => {
            expect(executeAction.name).toBe('EXECUTE_BLESS');
            expect(executeAction.description).toBe('Execute a function on the Bless Network');
            expect(executeAction.similes).toEqual(['RUN_BLESS', 'CALL_BLESS', 'INVOKE_BLESS']);
            expect(executeAction.suppressInitialMessage).toBe(true);
            expect(executeAction.examples).toBeDefined();
            expect(Array.isArray(executeAction.examples)).toBe(true);
        });

        it('should have valid examples', () => {
            executeAction.examples.forEach(example => {
                expect(Array.isArray(example)).toBe(true);
                example.forEach(interaction => {
                    expect(interaction).toHaveProperty('user');
                    expect(interaction).toHaveProperty('content');
                });
            });
        });
    });

    describe('handler execution', () => {
        let executeBlessMock;

        beforeEach(() => {
            // Mock the executeBless function
            executeBlessMock = vi.fn().mockResolvedValue({
                results: [
                    {
                        result: {
                            stdout: 'Function executed successfully',
                            stderr: ''
                        }
                    }
                ],
                cluster: {
                    peers: ['node1']
                }
            });

            // Add the mock to the module
            vi.mock('../../src/utils/bless', () => ({
                executeBless: executeBlessMock
            }));
        });

        it('should extract functionId from message and execute bless function', async () => {
            mockMessage.content.text = 'Run this function on bless network with ID: bafybeihykld7uyxzogmt6zrr2u7ixv3pdjfj3fixq43yfagcqkp7bvh3ke';
            
            await executeAction.handler(mockRuntime, mockMessage, mockState, {}, mockCallback);
            
            expect(executeBlessMock).toHaveBeenCalledWith({
                functionId: 'bafybeihykld7uyxzogmt6zrr2u7ixv3pdjfj3fixq43yfagcqkp7bvh3ke',
                method: 'blessnet.wasm',
                path: '/',
                httpMethod: 'GET',
                numberOfNodes: 1
            });
            
            expect(mockCallback).toHaveBeenCalledWith({
                text: 'Function executed successfully\n\nExecuted on 1 node(s): node1'
            });
        });

        it('should use default functionId when none is provided', async () => {
            mockMessage.content.text = 'Run something on bless network';
            
            await executeAction.handler(mockRuntime, mockMessage, mockState, {}, mockCallback);
            
            expect(executeBlessMock).toHaveBeenCalledWith(expect.objectContaining({
                functionId: 'lol',
                method: 'blessnet.wasm'
            }));
        });

        it('should extract custom method when specified', async () => {
            mockMessage.content.text = 'Run on bless network method: custom.function';
            
            await executeAction.handler(mockRuntime, mockMessage, mockState, {}, mockCallback);
            
            expect(executeBlessMock).toHaveBeenCalledWith(expect.objectContaining({
                method: 'custom.function'
            }));
        });

        it('should handle errors gracefully', async () => {
            executeBlessMock.mockRejectedValue(new Error('Network failure'));
            mockMessage.content.text = 'Run on bless network';
            
            await executeAction.handler(mockRuntime, mockMessage, mockState, {}, mockCallback);
            
            expect(mockCallback).toHaveBeenCalledWith({
                text: expect.stringContaining('Failed to execute function on the Bless Network: Network failure')
            });
        });
    });
}); 