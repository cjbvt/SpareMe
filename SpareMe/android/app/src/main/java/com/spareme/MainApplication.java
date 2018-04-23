package com.spareme;

import android.app.Application;

import com.facebook.react.ReactApplication;
<<<<<<< HEAD
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
=======
import com.brentvatne.react.ReactVideoPackage;
>>>>>>> 2224039320fb83ee27c84e251165e1110a94a35f
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
<<<<<<< HEAD
            new SplashScreenReactPackage(),
=======
            new ReactVideoPackage(),
>>>>>>> 2224039320fb83ee27c84e251165e1110a94a35f
        new RNFirebasePackage(),
        new RNFirebaseAuthPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
