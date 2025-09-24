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
  const [llmModels, setLlmModels] = useState([]);

  const loginBotUser = async () => {
    await window.api.send("loginBotUser");
    refreshBotConfig();
  };

  const onChangeSelectedBotUser = (botUser) => {
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
    saveBotSettings();
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

  const saveBotSettings = async () => {
    toast.info("Saving Bot Settings...");
    let botUsers = { ...botConfig.botUsers };
    botUsers[selectedBot] = {
      ...botUsers[selectedBot],
      aiSettings,
      role: selectedRole,
    };
    await updateBotConfig({ ...botConfig, botUsers });
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
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <label>API Key</label>
                <input
                  type="password"
                  value={aiSettings.apiKey}
                  onChange={(e) => updateAiSetting("apiKey", e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <label>Base URL</label>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1"
                  value={aiSettings.baseURL}
                  onChange={(e) => updateAiSetting("baseURL", e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <label>Model</label>
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
                <label>Max Tokens</label>
                <input
                  type="number"
                  value={aiSettings.maxTokens}
                  onChange={(e) =>
                    updateAiSetting("maxTokens", parseInt(e.target.value))
                  }
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <label>Temperature</label>
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
                <label>Personality Prompt</label>
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
