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

export function Profile() {
  const { t } = useTranslation();
  const { user, isLoading, error, getProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

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
      <div className="flex items-center justify-between">
        <h2>{t('profile.title')}</h2>
      </div>

      {isLoading && (
        <div className="p-4 rounded border bg-white">{t('common.loading')}</div>
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
                  <span className="text-muted-foreground">{t('common.status')}</span>
                  {user.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800">
                      {t('common.active')}
                    </Badge>
                  ) : user.status === "invited" ? (
                    <Badge className="bg-amber-100 text-amber-800">
                      {t('common.pending')}
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
                  <span className="text-muted-foreground">{t('common.role')}</span>
                  <Badge variant="outline">
                    {user.roles?.[0]?.name ?? "N/A"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Two-Factor Auth</span>
                  {user.twoFactorEnabled ? (
                    <Badge className="bg-green-100 text-green-800">
                      {t('common.enabled')}
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800">
                      {t('common.disabled')}
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
                    {t('profile.lastActive')}:
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
                  {t('profile.profileTab')}
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="rounded-none bg-transparent border-b-2 border-transparent px-4 pb-3 h-auto hover:bg-transparent hover:text-black data-[state=active]:border-b-[#2E343E] data-[state=active]:text-black"
                >
                  {t('profile.securityTab')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 pt-6">
                <Card className="bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t('profile.personalInformation')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                        <Input
                          id="firstName"
                          value={user.firstName ?? ""}
                          disabled
                          className="bg-black/5 border-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                        <Input
                          id="lastName"
                          value={user.lastName ?? ""}
                          disabled
                          className="bg-black/5 border-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('profile.email')}</Label>
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
                        <Label>{t('profile.role')}</Label>
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
                              {t('profile.noRole')}
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
                    <CardTitle className="text-lg">{t('profile.securityTab')}</CardTitle>
                    <CardDescription>{t('profile.securityDetails')}</CardDescription>
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
                          {t('profile.lastActive')}
                        </div>
                        <div className="text-sm font-medium">
                          {formatDateTime(user.lastLogin)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="bg-black/10 text-black"
                        disabled
                      >
                        {t('profile.manage2FA')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {!isLoading && !user && !error && (
        <div className="p-4 rounded border bg-white">{t('profile.noProfileData')}</div>
      )}
    </div>
  );
}

export default Profile;
