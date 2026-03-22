import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";
import { Avatar, AvatarFallback } from "../components/ui/data-display/avatar";
import { Badge } from "../components/ui/data-display/badge";
import { Button } from "../components/ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/data-display/card";
import { Input } from "../components/ui/form/input";
import { Label } from "../components/ui/form/label";
import { Separator } from "../components/ui/layout/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/navigation/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import authService from "../services/auth/authService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/overlay/dialog";

export function Profile() {
  const { t } = useTranslation();
  const { user, isLoading, error, getProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const [mfaStarting, setMfaStarting] = useState(false);
  const [mfaConfirming, setMfaConfirming] = useState(false);
  const [mfaDisabling, setMfaDisabling] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [setupInfo, setSetupInfo] = useState<{ secret: string; otpauthUrl: string; qrCodeDataUrl?: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);

  // No auto-enable: user must enter a 6-digit code after scanning

  useEffect(() => {
    if (!user) {
      void getProfile();
    }
  }, [user, getProfile]);

  const formatDateTime = (value?: Date) => {
    if (!value) return "-";
    try {
      return new Date(value as unknown as string).toLocaleString();
    } catch {
      return String(value);
    }
  };

  const fullName = useMemo(() => {
    if (!user) return "";
    return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  }, [user]);

  const initials = useMemo(() => {
    const name = fullName || user?.email || "";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [fullName, user?.email]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          className=" border-0 bg-[#E0F2FE] transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-[1px]"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("profile.back")}
        </Button>
        <h2>{t("profile.title")}</h2>
      </div>

      {isLoading && (
        <div className="p-4 rounded border bg-white">{t("common.loading")}</div>
      )}

      {error && (
        <div className="p-4 rounded border border-red-300 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {user && (
        <div className="grid grid-cols-12 gap-6">
          {/* Left summary card */}
          <Card className="col-span-12 lg:col-span-3 bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{fullName || user.email}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t("common.status")}
                  </span>
                  {user.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800">
                      {t("common.active")}
                    </Badge>
                  ) : user.status === "invited" ? (
                    <Badge className="bg-amber-100 text-amber-800">
                      {t("common.pending")}
                    </Badge>
                  ) : user.status ? (
                    <Badge className="bg-gray-100 text-gray-800">
                      {user.status}
                    </Badge>
                  ) : (
                    <Badge variant="outline">-</Badge>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t("common.role")}
                  </span>
                  <Badge variant="outline">
                    {user.roles?.[0]?.name ?? "N/A"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Two-Factor Auth</span>
                  {user.twoFactorEnabled ? (
                    <Badge className="bg-green-100 text-green-800">
                      {t("common.enabled")}
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800">
                      {t("common.disabled")}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">User ID:</span>
                  <span>{user.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {t("profile.lastActive")}:
                  </span>
                  <span>{formatDateTime(user.lastLogin)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right tabbed content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-[#E3F5FF] w-full justify-start border-b rounded-md drop-shadow-sm shadow-gray-50 items-center h-auto p-2">
                <TabsTrigger
                  value="profile"
                  className="rounded-none bg-transparent border-b-2 border-transparent px-4 pb-3 h-auto hover:bg-transparent hover:text-black data-[state=active]:border-b-[#2E343E] data-[state=active]:text-black"
                >
                  {t("profile.profileTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="rounded-none bg-transparent border-b-2 border-transparent px-4 pb-3 h-auto hover:bg-transparent hover:text-black data-[state=active]:border-b-[#2E343E] data-[state=active]:text-black"
                >
                  {t("profile.securityTab")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 pt-6">
                <Card className="bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("profile.personalInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          {t("profile.firstName")}
                        </Label>
                        <Input
                          id="firstName"
                          value={user.firstName ?? ""}
                          disabled
                          className="bg-black/5 border-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          {t("profile.lastName")}
                        </Label>
                        <Input
                          id="lastName"
                          value={user.lastName ?? ""}
                          disabled
                          className="bg-black/5 border-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("profile.email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          disabled
                          className="bg-black/5 border-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                          id="userId"
                          value={String(user.id)}
                          disabled
                          className="bg-black/5 border-0"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t("profile.role")}</Label>
                        <div className="flex flex-wrap gap-2">
                          {user.roles?.length ? (
                            user.roles.map((r) => (
                              <Badge
                                key={r.id}
                                variant="outline"
                                title={r.description || r.name}
                              >
                                {r.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-600">
                              {t("profile.noRole")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 pt-6">
                <Card className="bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("profile.securityTab")}
                    </CardTitle>
                    <CardDescription>
                      {t("profile.securityDetails")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Two-Factor Authentication
                        </div>
                        <div className="text-sm font-medium">
                          {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          {t("profile.lastActive")}
                        </div>
                        <div className="text-sm font-medium">
                          {formatDateTime(user.lastLogin)}
                        </div>
                      </div>
                    </div>
                    {mfaError && (
                      <div className="mt-4 p-2 rounded bg-red-50 text-red-700 border border-red-200 text-sm">{mfaError}</div>
                    )}
                    <div className="mt-4 space-y-4">
                      {!user.twoFactorEnabled && (
                        <Button
                          variant="outline"
                          className="bg-black/10 text-black"
                          disabled={mfaStarting}
                          onClick={async () => {
                            setMfaError(null);
                            setRecoveryCodes(null);
                            setSetupInfo(null);
                            setMfaCode("");
                            setMfaDialogOpen(true);
                            setMfaStarting(true);
                            try {
                              const res = await authService.startTotpSetup();
                              if (res.success && res.data) setSetupInfo(res.data as any);
                              else setMfaError(res.message);
                            } catch (e: any) {
                              setMfaError(e?.message || "Failed to start setup");
                            } finally {
                              setMfaStarting(false);
                            }
                          }}
                        >
                          Enable 2FA
                        </Button>
                      )}

                      {user.twoFactorEnabled && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              disabled={mfaDisabling}
                              onClick={async () => {
                                setMfaError(null);
                                setMfaDisabling(true);
                                try {
                                  const res = await authService.disableTotp();
                                  if (!res.success) setMfaError(res.message);
                                  await getProfile();
                                } catch (e: any) {
                                  setMfaError(e?.message || "Failed to disable 2FA");
                                } finally {
                                  setMfaDisabling(false);
                                }
                              }}
                            >
                              Disable 2FA
                            </Button>
                            <Button
                              onClick={async () => {
                                setMfaError(null);
                                try {
                                  const res = await authService.getRecoveryCodes();
                                  if (res.success && res.data) setRecoveryCodes(res.data.recoveryCodes);
                                  else setMfaError(res.message);
                                } catch (e: any) {
                                  setMfaError(e?.message || "Failed to get recovery codes");
                                }
                              }}
                            >
                              View Recovery Codes
                            </Button>
                          </div>
                        </div>
                      )}

                      {recoveryCodes && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Recovery Codes</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {recoveryCodes.map((c) => (
                              <div key={c} className="text-sm bg-white p-2 rounded font-mono select-all">{c}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {!isLoading && !user && !error && (
        <div className="p-4 rounded border bg-white">
          {t("profile.noProfileData")}
        </div>
      )}

      {/* 2FA Setup Modal */}
      <Dialog open={mfaDialogOpen} onOpenChange={(open) => {
        setMfaDialogOpen(open);
        if (!open) {
          setSetupInfo(null);
          setMfaCode("");
          setMfaError(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR with your authenticator app, then enter the 6-digit code to enable 2FA.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!setupInfo && (
              <div className="text-sm text-muted-foreground">Preparing setup...</div>
            )}
            {setupInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Scan QR</div>
                  {setupInfo.qrCodeDataUrl ? (
                    <img src={setupInfo.qrCodeDataUrl} alt="QR Code" className="w-48 h-48 bg-white p-2 rounded" />
                  ) : (
                    <div className="text-xs text-muted-foreground break-all">{setupInfo.otpauthUrl}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Secret</div>
                  <div className="text-xs bg-white p-2 rounded break-all select-all">{setupInfo.secret}</div>
                </div>
              </div>
            )}

            {mfaError && (
              <div className="p-2 rounded bg-red-50 text-red-700 border border-red-200 text-sm">{mfaError}</div>
            )}

            {/* Manual code entry (required) */}
            {setupInfo && (
              <div className="space-y-2">
                <Label htmlFor="mfaCode">Enter 6-digit code</Label>
                <Input
                  id="mfaCode"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  pattern="\\d*"
                  maxLength={6}
                  className="bg-black/5 border-0"
                  placeholder="123456"
                />
                <div className="flex gap-2">
                  <Button
                    className="bg-[#2E343E] text-white"
                    disabled={mfaConfirming || mfaCode.length !== 6}
                    onClick={async () => {
                      setMfaError(null);
                      setMfaConfirming(true);
                      try {
                        const res = await authService.confirmTotpSetup({ code: mfaCode });
                        if (res.success) {
                          setRecoveryCodes(res.data?.recoveryCodes || null);
                          await getProfile();
                          setMfaDialogOpen(false);
                        } else {
                          setMfaError(res.message);
                        }
                      } catch (e: any) {
                        setMfaError(e?.message || "Failed to confirm 2FA");
                      } finally {
                        setMfaConfirming(false);
                      }
                    }}
                  >
                    {mfaConfirming ? "Enabling..." : "Confirm"}
                  </Button>
                  <Button variant="outline" onClick={() => setMfaDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Profile;
