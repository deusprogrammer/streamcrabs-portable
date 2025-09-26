import React, { useEffect, useState } from "react";
import { useConfig } from "../hooks/BotConfigHook";
import { toast } from "react-toastify";
import { getOpenAIModels } from "../api/StreamCrabsApi";

const Settings = () => {
  const [botConfig, updateBotConfig, refreshBotConfig] = useConfig();
  const [animationSubPanel, setAnimationSubPanel] = useState("default");
  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedRole, setSelectedRole] = useState("twitch-bot");
  const [aiSettings, setAiSettings] = useState({
    aiEnabled: false,
    aiModerationEnabled: false,
    apiKey: "",
    baseURL: "https://api.openai.com/v1",
    model: "gpt-3.5-turbo",
    maxTokens: 150,
    temperature: 0.7,
    chatBotPersonalityPrompt: "",
    moderationModel: "gpt-3.5-turbo",
    moderationBaseURL: "https://api.openai.com/v1",
    violencePrompt: "",
    sexualPrompt: "",
    politicalPrompt: "",
    racialPrompt: "",
  });
  const [summarizationAgent, setSummarizationAgent] = useState({
    enabled: false,
    apiKey: "",
    baseURL: "https://api.openai.com/v1",
    model: "gpt-3.5-turbo",
    maxTokens: 500,
    temperature: 0.3,
    messageThreshold: 50,
    tokenThreshold: 3000, // Add this
  });
  const [llmModels, setLlmModels] = useState([]);

  const tooltipStyle = {
    position: "relative",
    display: "inline-block",
    cursor: "help",
    marginLeft: "5px",
    color: "#888",
    fontSize: "12px",
  };

  const tooltipTextStyle = {
    visibility: "hidden",
    width: "300px",
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "left",
    borderRadius: "6px",
    padding: "8px",
    position: "absolute",
    zIndex: "1",
    top: "50%",
    left: "100%",
    marginLeft: "10px",
    marginTop: "-20px",
    opacity: "0",
    transition: "opacity 0.3s",
    fontSize: "12px",
    lineHeight: "1.4",
  };

  const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div
        style={tooltipStyle}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <div
          style={{
            ...tooltipTextStyle,
            visibility: isVisible ? "visible" : "hidden",
            opacity: isVisible ? "1" : "0",
          }}
        >
          {text}
        </div>
      </div>
    );
  };

  const loginBotUser = async () => {
    await window.api.send("loginBotUser");
    refreshBotConfig();
  };

  const onChangeSelectedBotUser = async (botUser) => {
    await saveBotSettings();
    setSelectedBot(botUser);
    setAiSettings(
      botConfig?.botUsers[botUser]?.aiSettings || {
        aiEnabled: false,
        aiModerationEnabled: false,
        apiKey: "",
        baseURL: "https://api.openai.com/v1",
        model: "gpt-3.5-turbo",
        maxTokens: 150,
        temperature: 0.7,
        chatBotPersonalityPrompt: "",
        moderationModel: "gpt-3.5-turbo",
        moderationBaseURL: "https://api.openai.com/v1",
        violencePrompt: "",
        sexualPrompt: "",
        politicalPrompt: "",
        racialPrompt: "",
      }
    );
  };

  const deleteBotUser = async (botUser) => {
    await window.api.send("deleteBotUser", botUser);
    refreshBotConfig();
  };

  const updateAiSetting = (setting, value) => {
    const newAiSettings = { ...aiSettings };
    newAiSettings[setting] = value;
    setAiSettings({ ...newAiSettings });
  };

  const updateSummarizationSetting = (setting, value) => {
    const newSummarizationAgent = { ...summarizationAgent };
    newSummarizationAgent[setting] = value;
    setSummarizationAgent({ ...newSummarizationAgent });
  };

  const saveBotSettings = async () => {
    toast.info("Saving Bot Settings...");
    let botUsers = { ...botConfig.botUsers };
    botUsers[selectedBot] = {
      ...botUsers[selectedBot],
      aiSettings,
      role: selectedRole,
    };

    // Save summarization agent at bot config level
    const newBotConfig = {
      ...botConfig,
      botUsers,
      aiSettings: {
        ...botConfig.aiSettings,
        summarizationAgent,
      },
    };

    await updateBotConfig(newBotConfig);
    toast.info("Bot settings saved!");
  };

  const refreshOpenAIModels = async () => {
    if (!aiSettings.apiKey) {
      toast.error("Please enter an API key first");
      return;
    }

    try {
      toast.info("Fetching OpenAI models...");
      const models = await getOpenAIModels(
        aiSettings.apiKey,
        aiSettings.baseURL
      );
      setLlmModels(models);
      updateBotConfig({ ...botConfig, llmModels: models });
      toast.success(`Loaded ${models.length} models`);
    } catch (error) {
      toast.error("Failed to fetch models: " + error.message);
    }
  };

  const refreshSummarizationModels = async () => {
    if (!summarizationAgent.apiKey) {
      toast.error("Please enter a summarization API key first");
      return;
    }

    try {
      toast.info("Fetching summarization models...");
      const models = await getOpenAIModels(
        summarizationAgent.apiKey,
        summarizationAgent.baseURL
      );
      setLlmModels(models);
      updateBotConfig({ ...botConfig, llmModels: models });
      toast.success(`Loaded ${models.length} models`);
    } catch (error) {
      toast.error("Failed to fetch models: " + error.message);
    }
  };

  useEffect(() => {
    let botUser = selectedBot;
    if (!botUser) {
      botUser = botConfig?.twitchChannel;
      setSelectedBot(botConfig?.twitchChannel);
    }
    if (botConfig?.botUsers?.[botUser]?.aiSettings) {
      setAiSettings(botConfig?.botUsers?.[botUser]?.aiSettings);
    }
    setSelectedRole(botConfig?.botUsers?.[botUser]?.role || "twitch-bot");
    setLlmModels(botConfig?.llmModels || []);

    // Load summarization agent settings
    setSummarizationAgent(
      botConfig?.aiSettings?.summarizationAgent || {
        enabled: false,
        apiKey: "",
        baseURL: "https://api.openai.com/v1",
        model: "gpt-3.5-turbo",
        maxTokens: 500,
        temperature: 0.3,
        messageThreshold: 50,
        tokenThreshold: 3000, // Add this
      }
    );
  }, [botConfig, selectedBot]);

  return (
    <div>
      <h1>Settings</h1>
      <h2>Overlay URLs</h2>
      <p>
        Bring the below into your XSplit or OBS presentation layouts to show
        monsters and battle notifications. It is recommended to place the
        encounter panel on either side of the screen, and the notification panel
        on the top or bottom of the screen.
      </p>
      <div style={{ display: "table" }}>
        <div style={{ display: "table-row" }}>
          <div
            style={{
              display: "table-cell",
              padding: "10px",
              fontWeight: "bolder",
            }}
          >
            Soundboard:
          </div>
          <div style={{ display: "table-cell", padding: "10px" }}>
            <input
              type="text"
              value={`http://localhost:${botConfig?.imageServerPort}/overlays/sound-player`}
              style={{ width: "400px" }}
            />
          </div>
        </div>
        <div style={{ display: "table-row" }}>
          <div
            style={{
              display: "table-cell",
              padding: "10px",
              fontWeight: "bolder",
            }}
          >
            Animation Overlay:
          </div>
          <div style={{ display: "table-cell", padding: "10px" }}>
            <input
              type="text"
              value={`http://localhost:${
                botConfig?.imageServerPort
              }/overlays/multi${
                animationSubPanel ? `?subPanel=${animationSubPanel}` : ""
              }`}
              style={{ width: "400px" }}
            />
          </div>
          <div>
            <input
              type="text"
              value={animationSubPanel}
              onChange={(e) => setAnimationSubPanel(e.target.value)}
            />
          </div>
        </div>
      </div>

      <h2>Global AI Settings</h2>
      <div
        style={{
          border: "1px solid white",
          margin: "10px 20px 10px 20px",
          padding: "10px",
        }}
      >
        <h3>Summarization Agent</h3>
        <div>
          <input
            type="checkbox"
            checked={summarizationAgent.enabled}
            onChange={(e) =>
              updateSummarizationSetting("enabled", e.target.checked)
            }
          />
          <label>Enable Summarization Agent</label>
          <Tooltip text="When enabled, the summarization agent will compress chat history to manage context length and reduce API costs.">
            ℹ️
          </Tooltip>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
          <div>
            <label>API Key</label>
            <Tooltip text="Your OpenAI API key. This will be used to authenticate requests to the OpenAI API for summarization.">
              ℹ️
            </Tooltip>
          </div>
          <input
            type="password"
            value={summarizationAgent.apiKey}
            onChange={(e) =>
              updateSummarizationSetting("apiKey", e.target.value)
            }
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
          <div>
            <label>Base URL</label>
            <Tooltip text="The API endpoint URL. Use https://api.openai.com/v1 for OpenAI, or a custom URL for services like Ollama (e.g., http://localhost:11434/v1).">
              ℹ️
            </Tooltip>
          </div>
          <input
            type="text"
            placeholder="https://api.openai.com/v1"
            value={summarizationAgent.baseURL}
            onChange={(e) =>
              updateSummarizationSetting("baseURL", e.target.value)
            }
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
          <div>
            <label>Model</label>
            <Tooltip text="The AI model to use for summarization. GPT-3.5-turbo is cost-effective, while GPT-4 provides higher quality summaries.">
              ℹ️
            </Tooltip>
          </div>
          <select
            value={summarizationAgent.model}
            onChange={(e) =>
              updateSummarizationSetting("model", e.target.value)
            }
          >
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            <option value="gpt-4">gpt-4</option>
            <option value="gpt-4-turbo">gpt-4-turbo</option>
            {llmModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.id}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
          <div>
            <label>Max Tokens</label>
            <Tooltip text="Maximum number of tokens the model can generate. Higher values allow longer summaries but cost more. 1 token ≈ 4 characters.">
              ℹ️
            </Tooltip>
          </div>
          <input
            type="number"
            value={summarizationAgent.maxTokens}
            onChange={(e) =>
              updateSummarizationSetting("maxTokens", parseInt(e.target.value))
            }
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
          <div>
            <label>Temperature</label>
            <Tooltip text="Controls randomness in responses (0.0-2.0). Lower values (0.1-0.3) produce more consistent, factual summaries. Higher values (0.7-1.0) produce more creative responses.">
              ℹ️
            </Tooltip>
          </div>
          <input
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={summarizationAgent.temperature}
            onChange={(e) =>
              updateSummarizationSetting(
                "temperature",
                parseFloat(e.target.value)
              )
            }
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
          <div>
            <label>Message Threshold</label>
            <Tooltip text="Number of messages in the conversation before summarization is triggered.">
              ℹ️
            </Tooltip>
          </div>
          <input
            type="number"
            min="1"
            value={summarizationAgent.messageThreshold}
            onChange={(e) =>
              updateSummarizationSetting(
                "messageThreshold",
                parseInt(e.target.value)
              )
            }
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
          <div>
            <label>Token Threshold</label>
            <Tooltip text="Approximate token count before conversation gets summarized. Higher values allow longer conversations but may hit API limits.">
              ℹ️
            </Tooltip>
          </div>
          <input
            type="number"
            min="1000"
            max="10000"
            value={summarizationAgent.tokenThreshold}
            onChange={(e) =>
              updateSummarizationSetting(
                "tokenThreshold",
                parseInt(e.target.value)
              )
            }
          />
        </div>

        <button onClick={refreshSummarizationModels}>Refresh Models</button>
      </div>

      <h2>Bot Users</h2>
      <table>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(botConfig?.botUsers || {}).map((userName) => {
            return (
              <tr key={`bot-user-${userName}`}>
                <td>{userName}</td>
                {botConfig.twitchChannel !== userName ? (
                  <td>
                    <button
                      onClick={() => {
                        deleteBotUser(userName);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                ) : (
                  <td></td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <button
        onClick={() => {
          loginBotUser();
        }}
      >
        Add Bot User
      </button>
      <h2>Bot Settings</h2>
      <div>
        <h3>Bot</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
          <label>Modify Settings For:</label>
          <select
            value={selectedBot}
            onChange={(e) => onChangeSelectedBotUser(e.target.value)}
          >
            {Object.keys(botConfig?.botUsers || {}).map((userName) => {
              return (
                <option key={`ai-bot-${userName}`} value={userName}>
                  {userName}
                </option>
              );
            })}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
          <label>Bot Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="twitch-bot">Twitch Bot</option>
            <option value="chat-bot">Chat Bot</option>
          </select>
        </div>
        {selectedRole === "chat-bot" ? (
          <>
            <h3>AI Integration</h3>
            <div
              style={{
                border: "1px solid white",
                margin: "10px 20px 10px 20px",
                padding: "10px",
              }}
            >
              <div>
                <input
                  type="checkbox"
                  checked={aiSettings.aiEnabled}
                  onChange={(e) =>
                    updateAiSetting("aiEnabled", e.target.checked)
                  }
                />
                <label>Enable Bot Personality</label>
                <Tooltip text="When enabled, the bot will respond to chat messages that mention its name using AI with the configured personality.">
                  ℹ️
                </Tooltip>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <div>
                  <label>API Key</label>
                  <Tooltip text="Your OpenAI API key for this bot. Each bot can have its own API key for separate billing/usage tracking.">
                    ℹ️
                  </Tooltip>
                </div>
                <input
                  type="password"
                  value={aiSettings.apiKey}
                  onChange={(e) => updateAiSetting("apiKey", e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <div>
                  <label>Base URL</label>
                  <Tooltip text="The API endpoint URL. Use https://api.openai.com/v1 for OpenAI, or a custom URL for services like Ollama (e.g., http://localhost:11434/v1).">
                    ℹ️
                  </Tooltip>
                </div>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1"
                  value={aiSettings.baseURL}
                  onChange={(e) => updateAiSetting("baseURL", e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <div>
                  <label>Model</label>
                  <Tooltip text="The AI model to use for chat responses. GPT-3.5-turbo is fast and cost-effective for chat. GPT-4 provides higher quality responses.">
                    ℹ️
                  </Tooltip>
                </div>
                <select
                  value={aiSettings.model}
                  onChange={(e) => updateAiSetting("model", e.target.value)}
                >
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  <option value="gpt-4">gpt-4</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                  {llmModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.id}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <div>
                  <label>Max Tokens</label>
                  <Tooltip text="Maximum length of bot responses. 150 tokens ≈ 110 words, good for chat. Higher values allow longer responses but cost more.">
                    ℹ️
                  </Tooltip>
                </div>
                <input
                  type="number"
                  value={aiSettings.maxTokens}
                  onChange={(e) =>
                    updateAiSetting("maxTokens", parseInt(e.target.value))
                  }
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <div>
                  <label>Temperature</label>
                  <Tooltip text="Controls creativity/randomness (0.0-2.0). Lower values (0.1-0.5) are more focused and consistent. Higher values (0.7-1.2) are more creative and varied.">
                    ℹ️
                  </Tooltip>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={aiSettings.temperature}
                  onChange={(e) =>
                    updateAiSetting("temperature", parseFloat(e.target.value))
                  }
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <div>
                  <label>Personality Prompt</label>
                  <Tooltip text="Describes the bot's personality and behavior. Be specific about tone, interests, and how the bot should interact with viewers.">
                    ℹ️
                  </Tooltip>
                </div>
                <textarea
                  onChange={(e) => {
                    updateAiSetting("chatBotPersonalityPrompt", e.target.value);
                  }}
                  value={aiSettings.chatBotPersonalityPrompt}
                ></textarea>
              </div>

              <button onClick={refreshOpenAIModels}>Refresh Models</button>
            </div>
          </>
        ) : null}
        <button
          onClick={() => {
            saveBotSettings();
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
