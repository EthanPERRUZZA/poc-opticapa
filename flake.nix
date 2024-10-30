{
  description = "A Nix flake for OSRD dev shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    flake-compat.url = "https://flakehub.com/f/edolstra/flake-compat/1.tar.gz";
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      fenix,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

        pythonPackages = ps: (import ./nix/python_env.nix { inherit ps; });

        fixedNode = pkgs.nodejs_20;
        fixedNodePackages = pkgs.nodePackages.override {
          nodejs = fixedNode;
        };
      in
      with pkgs;
      {
        devShells.default = mkShell {
          buildInputs = [
            # Front
            fixedNodePackages.create-react-app
            fixedNodePackages.eslint
            fixedNodePackages.yarn
            fixedNode

            # Nix formatter
            nixfmt-rfc-style
            nixd

          ];
        };
      }
    );
}
